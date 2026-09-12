/**
 * Dodaje ~1000 popularnych polskich produktów spożywczych do bazy
 * js/products-data-raw.js. Format wpisu (krótki tuple):
 *   [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra?]
 * Makro w przeliczeniu na 100 g. kcal i unsatFat liczone automatycznie.
 *
 * Uruchom:
 *   node scripts/add-products-1000.mjs            # dry-run: raport + ostrzeżenia
 *   node scripts/add-products-1000.mjs --write    # dopisuje do bazy
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawPath = path.join(root, 'js', 'products-data-raw.js');

const CAT = new Set([
    'mieso', 'nabial', 'sery', 'warzywa', 'owoce', 'zboza', 'platki-sniadaniowe',
    'polskie-obiadki', 'zupy', 'orzechy', 'tluszcze', 'makarony', 'mrozone-pizze',
    'fastfood', 'slodycze', 'batony', 'batony-proteinowe', 'sosy', 'napoje',
    'alkohole', 'przyprawy'
]);

// [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra?]
const NEW = [
    ['Szynka wieprzowa gotowana', '🍖', 'mieso', 'plaster (20g)', 0.2, 21, 1, 6, 2.2, 'Uniwersalna wędlina do kanapek.'],
    ['Szynka z indyka', '🦃', 'mieso', 'plaster (20g)', 0.2, 21, 1, 2, 0.7, 'Chudsza alternatywa dla wieprzowiny.'],
    ['Polędwica sopocka', '🍖', 'mieso', 'plaster (20g)', 0.2, 21, 1, 7, 2.8, 'Delikatna wędlina wieprzowa.'],
    ['Polędwica z kurczaka', '🍗', 'mieso', 'plaster (20g)', 0.2, 19, 2, 2.5, 0.8, 'Pieczona polędwica drobiowa.'],
    ['Szynka konserwowa', '🥫', 'mieso', 'plaster (20g)', 0.2, 16, 2, 4, 1.4, 'Szynka w puszce, drobno mielona.'],
    ['Kiełbasa szynkowa', '🌭', 'mieso', 'plaster (30g)', 0.3, 16, 2, 20, 7.5, 'Kiełbasa o wysokiej zawartości mięsa.'],
    ['Kiełbasa śląska', '🌭', 'mieso', 'sztuka (100g)', 1, 14, 2, 26, 10, 'Klasyczna biała kiełbasa śląska.'],
    ['Kiełbasa żywiecka', '🌭', 'mieso', 'sztuka (100g)', 1, 15, 2, 24, 9.5, 'Pieczona kiełbasa wieprzowa.'],
    ['Kiełbasa krakowska sucha', '🌭', 'mieso', 'plaster (25g)', 0.25, 20, 2, 33, 12, 'Sucha kiełbasa krakowska.'],
    ['Kiełbasa toruńska', '🌭', 'mieso', 'plaster (25g)', 0.25, 18, 2, 30, 11, 'Mielona kiełbasa toruńska.'],
    ['Kiełbasa jałowcowa', '🌭', 'mieso', 'plaster (25g)', 0.25, 17, 2, 28, 10, 'Wędzona kiełbasa z jałowcem.'],
    ['Kiełbasa myśliwska', '🌭', 'mieso', 'plaster (25g)', 0.25, 18, 1, 31, 11.5, 'Twarda kiełbasa myśliwska.'],
    ['Kiełbasa biała surowa', '🌭', 'mieso', 'sztuka (100g)', 1, 15, 2, 24, 9.5, 'Surowa biała kiełbasa na wielkanoc.'],
    ['Parówki wieprzowe', '🌭', 'mieso', 'sztuka (40g)', 0.4, 12, 3, 22, 8.5, 'Parówki parzone wieprzowe.'],
    ['Parówki z szynki', '🌭', 'mieso', 'sztuka (40g)', 0.4, 13, 2, 18, 7, 'Parówki z dodatkiem szynki.'],
    ['Parówki drobiowe', '🐔', 'mieso', 'sztuka (40g)', 0.4, 12, 3, 15, 5.5, 'Lżejsze parówki z kurczaka.'],
    ['Kabanosy', '🌭', 'mieso', 'sztuka (25g)', 0.25, 19, 2, 32, 12, 'Cienkie suszone kiełbaski.'],
    ['Kabanosy drobiowe', '🐔', 'mieso', 'sztuka (25g)', 0.25, 20, 2, 22, 8, 'Kabanosy z mięsa kurczaka.'],
    ['Mortadela', '🍖', 'mieso', 'plaster (25g)', 0.25, 12, 3, 25, 9, 'Mielona wędlina zbliżona do parówkowej.'],
    ['Pasztet wieprzowy', '🥫', 'mieso', 'plaster (30g)', 0.3, 10, 8, 24, 8.5, 'Pieczony pasztet z mięsa.'],
    ['Pasztet drobiowy', '🐔', 'mieso', 'plaster (30g)', 0.3, 11, 7, 20, 7, 'Pasztet z mięsa drobiowego.'],
    ['Pasztet z dziczyzny', '🦌', 'mieso', 'plaster (30g)', 0.3, 12, 6, 21, 7.5, 'Pasztet z dzika lub jelenia.'],
    ['Baleron', '🍖', 'mieso', 'plaster (25g)', 0.25, 21, 1, 8, 3, 'Pieczona wędlina z szynki.'],
    ['Boczek wędzony parzony', '🥓', 'mieso', 'plaster (30g)', 0.3, 9, 1, 53, 20, 'Tłusta wędlina z boczku.'],
    ['Boczek pieczony', '🥓', 'mieso', 'plaster (30g)', 0.3, 25, 1, 20, 7.5, 'Upieczony boczek, chudszy po wytopieniu.'],
    ['Kaszanka', '🍖', 'mieso', 'sztuka (150g)', 1.5, 12, 15, 25, 9, 'Kasza gryczana z krwią i podrobami.'],
    ['Kaszanka z wątróbką', '🍖', 'mieso', 'sztuka (150g)', 1.5, 13, 14, 24, 8.5, 'Kaszanka wzbogacona wątróbką.'],
    ['Salceson', '🍖', 'mieso', 'plaster (30g)', 0.3, 14, 4, 22, 8, 'Mielona wędlina z podrobami.'],
    ['Szynka z kurczaka (plastry)', '🍗', 'mieso', 'plaster (20g)', 0.2, 17, 2, 3, 0.9, 'Plastry szynki z piersi kurczaka.'],
    ['Szynka drobiowa', '🐔', 'mieso', 'plaster (20g)', 0.2, 17, 1, 3, 1, 'Drobna wędlina drobiowa.'],
    ['Chrupiące skrzydełka z kurczaka', '🍗', 'mieso', 'sztuka (100g)', 1, 22, 8, 14, 4, 'Skrzydełka w panierce lub marynacie.'],
    ['Skrzydełka z kurczaka', '🍗', 'mieso', 'sztuka (150g)', 1.5, 19, 0, 15, 4.5, 'Surowa porcja skrzydełek ze skórą.'],
    ['Serce drobiowe', '🐔', 'mieso', 'porcja (150g)', 1.5, 18, 1, 9, 2.8, 'Podroby bogate w żelazo.'],
    ['Żołądek wieprzowy', '🐷', 'mieso', 'porcja (150g)', 1.5, 16, 1, 8, 2.5, 'Tradycyjny polski podrób.'],
    ['Flaki wołowe', '🐄', 'mieso', 'porcja (150g)', 1.5, 15, 1, 10, 4, 'Podstawa tradycyjnej zupy flaki.'],
    ['Serca wieprzowe', '🐷', 'mieso', 'porcja (150g)', 1.5, 17, 1, 5, 1.8, 'Chude podroby wieprzowe.'],
    ['Nerki wieprzowe', '🐷', 'mieso', 'porcja (150g)', 1.5, 16, 1, 5, 1.8, 'Podroby o intensywnym smaku.'],
    ['Mięso mielone wieprzowo-wołowe', '🥩', 'mieso', 'porcja (150g)', 1.5, 18, 0, 20, 8, 'Mieszanka mielona na kotlety.'],
    ['Mięso mielone z indyka', '🦃', 'mieso', 'porcja (150g)', 1.5, 19, 0, 8, 2.5, 'Chude mielone z indyka.'],
    ['Mięso drobiowe mielone', '🐔', 'mieso', 'porcja (150g)', 1.5, 18, 0, 10, 3, 'Mielone z kurczaka.'],
    ['Karkówka wieprzowa', '🥩', 'mieso', 'porcja (150g)', 1.5, 17, 0, 20, 7.5, 'Tłustszy kawałek na grilla.'],
    ['Pieczeń rzymska', '🥩', 'mieso', 'plaster (100g)', 1, 17, 1, 14, 5.5, 'Pieczona mielona z jajkiem.'],
    ['Schabowe mięso (stek)', '🥩', 'mieso', 'porcja (150g)', 1.5, 21, 0, 8, 3, 'Chudy schab na steiki.'],
    ['Golonka wieprzowa', '🐷', 'mieso', 'porcja (250g)', 2.5, 19, 0, 20, 7.5, 'Golonka gotowana lub pieczona.'],
    ['Łopatka wieprzowa pieczona', '🐷', 'mieso', 'porcja (150g)', 1.5, 24, 0, 15, 5.5, 'Pieczona łopatka wieprzowa.'],
    ['Kotlet wieprzowy (schabowy)', '🥩', 'mieso', 'sztuka (150g)', 1.5, 22, 10, 15, 4.5, 'Klasyczny kotlet schabowy w panierce.'],
    ['Kotlet z karkówki', '🥩', 'mieso', 'sztuka (150g)', 1.5, 19, 1, 22, 8, 'Kotlet z karkówki, grillowany.'],
    ['Szynka wieprzowa (udziec)', '🐷', 'mieso', 'porcja (150g)', 1.5, 21, 0, 6, 2.2, 'Chudy udziec wieprzowy.'],
    ['Klopsiki wieprzowe', '🍖', 'mieso', 'sztuka (50g)', 0.5, 16, 8, 18, 6.5, 'Pulpety mięsne w sosie pomidorowym.'],
    ['Mintaj', '🐟', 'mieso', 'filet (150g)', 1.5, 17, 0, 0.8, 0.2, 'Chuda biała ryba morska.'],
    ['Morszczuk', '🐟', 'mieso', 'filet (150g)', 1.5, 16, 0, 1.5, 0.4, 'Delikatna ryba atlantycka.'],
    ['Sola', '🐟', 'mieso', 'filet (150g)', 1.5, 17, 0, 1.9, 0.5, 'Szlachetna biała ryba morska.'],
    ['Flądra', '🐟', 'mieso', 'sztuka (200g)', 2, 16, 0, 3, 0.7, 'Płaska ryba bałtycka.'],
    ['Pstrąg tęczowy', '🐟', 'mieso', 'sztuka (250g)', 2.5, 20, 0, 6, 1.4, 'Ryba słodkowodna bogata w omega-3.'],
    ['Pstrąg łososiowy', '🐟', 'mieso', 'filet (150g)', 1.5, 20, 0, 6.5, 1.5, 'Pstrąg o różowym mięsie.'],
    ['Karp', '🐟', 'mieso', 'porcja (200g)', 2, 17, 0, 6, 1.3, 'Świąteczna ryba słodkowodna.'],
    ['Sandacz', '🐟', 'mieso', 'filet (150g)', 1.5, 19, 0, 1.5, 0.4, 'Cenna chuda ryba słodkowodna.'],
    ['Okoń', '🐟', 'mieso', 'filet (150g)', 1.5, 18, 0, 1.2, 0.3, 'Ryba słodkowodna o delikatnym mięsie.'],
    ['Halibut', '🐟', 'mieso', 'filet (150g)', 1.5, 18, 0, 3, 0.6, 'Duża chuda ryba morska.'],
    ['Pangasius', '🐟', 'mieso', 'filet (150g)', 1.5, 15, 0, 3, 0.8, 'Ryba hodowlana z delty Mekongu.'],
    ['Miruna', '🐟', 'mieso', 'filet (150g)', 1.5, 16, 0, 1.2, 0.3, 'Ryba morska do panierki.'],
    ['Sardynki w oleju', '🐟', 'mieso', 'puszka (100g)', 1, 24, 0, 11, 2.5, 'Tłuste ryby w oleju, źródło omega-3.'],
    ['Sardynki w pomidorach', '🐟', 'mieso', 'puszka (100g)', 1, 20, 3, 10, 2.3, 'Sardynki w sosie pomidorowym.'],
    ['Szprotki wędzone', '🐟', 'mieso', 'porcja (100g)', 1, 21, 0, 13, 3, 'Wędzone szprotki bałtyckie.'],
    ['Makrela wędzona', '🐟', 'mieso', 'porcja (100g)', 1, 20, 0, 18, 4, 'Wędzona tłusta ryba morska.'],
    ['Łosoś wędzony na zimno', '🐟', 'mieso', 'plaster (30g)', 0.3, 23, 0, 9, 1.8, 'Wędzony łosoś na kanapki.'],
    ['Tuńczyk świeży (stek)', '🐟', 'mieso', 'stek (150g)', 1.5, 24, 0, 1, 0.3, 'Surowy tuńczyk na grilla.'],
    ['Krewetki (obrane)', '🦐', 'mieso', 'porcja (100g)', 1, 20, 1, 1, 0.3, 'Owoce morza niskokaloryczne.'],
    ['Krewetki królewskie', '🦐', 'mieso', 'porcja (150g)', 1.5, 21, 1, 1, 0.3, 'Duże krewetki na grilla.'],
    ['Kalmary', '🦑', 'mieso', 'porcja (150g)', 1.5, 17, 3, 1.4, 0.4, 'Owoce morza z mątwy.'],
    ['Ośmiornica', '🐙', 'mieso', 'porcja (150g)', 1.5, 16, 2, 1, 0.3, 'Chuda ośmiornica śródziemnomorska.'],
    ['Małże (mule)', '🦪', 'mieso', 'porcja (150g)', 1.5, 18, 5, 3, 0.7, 'Mule w białym sosie.'],
    ['Małże zielone', '🦪', 'mieso', 'porcja (150g)', 1.5, 17, 6, 3, 0.7, 'Nowozelandzkie małże.'],
    ['Ostrygi', '🦪', 'mieso', 'sztuka (100g)', 1, 9, 5, 2, 0.5, 'Surowe ostrygi morskie.'],
    ['Kawior', '🐟', 'mieso', 'łyżka (20g)', 0.2, 25, 4, 18, 4, 'Ikra jesiotra, luksusowy przysmak.'],
    ['Śledź w śmietanie', '🐟', 'mieso', 'porcja (100g)', 1, 12, 6, 15, 5, 'Śledź w sosie śmietanowym.'],
    ['Ryba po grecku', '🐟', 'mieso', 'porcja (200g)', 2, 12, 8, 8, 1.5, 'Ryba smażona w warzywach i pomidorach.'],
    ['Mleko 0,5%', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.4, 4.9, 0.5, 0.3, 'Najchudsze mleko spożywcze.'],
    ['Mleko 1,5%', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.4, 4.9, 1.5, 1, 'Mleko półchude do kawy.'],
    ['Mleko 2%', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.3, 4.9, 2, 1.3, 'Mleko pasteryzowane 2%.'],
    ['Mleko 3,2%', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.2, 4.8, 3.2, 2.1, 'Pełnotłuste mleko świeże.'],
    ['Mleko bez laktozy', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.4, 4.9, 1.5, 1, 'Mleko dla osób z nietolerancją laktozy.'],
    ['Mleko kozie', '🐐', 'nabial', 'szklanka (250ml)', 2.5, 3.3, 4.5, 4, 2.8, 'Mleko kozie, łatwiej strawne.'],
    ['Maślanka naturalna', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.3, 4.8, 1, 0.6, 'Fermentowany napój mleczny.'],
    ['Maślanka owocowa', '🥤', 'nabial', 'szklanka (250ml)', 2.5, 2.8, 10, 1, 0.6, 'Maślanka z dodatkiem owoców i cukru.'],
    ['Kefir naturalny', '🥛', 'nabial', 'szklanka (250ml)', 2.5, 3.3, 4, 2, 1.3, 'Probiotyczny napój mleczny.'],
    ['Kefir owocowy', '🥤', 'nabial', 'szklanka (250ml)', 2.5, 2.8, 9, 2, 1.3, 'Kefir z owocami i cukrem.'],
    ['Jogurt naturalny', '🥛', 'nabial', 'kubek (150g)', 1.5, 4.5, 6, 3, 2, 'Klasyczny jogurt bałkański.'],
    ['Jogurt naturalny 0%', '🥛', 'nabial', 'kubek (150g)', 1.5, 5, 7, 0.1, 0.1, 'Jogurt bez dodatku tłuszczu.'],
    ['Jogurt grecki', '🥛', 'nabial', 'kubek (150g)', 1.5, 9, 4, 5, 3, 'Gęsty jogurt grecki.'],
    ['Jogurt grecki 0%', '🥛', 'nabial', 'kubek (150g)', 1.5, 10, 4, 0.2, 0.1, 'Odchudzony jogurt grecki.'],
    ['Skyr naturalny', '🥛', 'nabial', 'kubek (150g)', 1.5, 11, 4, 0.3, 0.1, 'Islandzki jogurt bogaty w białko.'],
    ['Skyr waniliowy', '🍮', 'nabial', 'kubek (150g)', 1.5, 8.5, 11, 0.3, 0.1, 'Skyr o smaku wanilii.'],
    ['Skyr owocowy', '🍓', 'nabial', 'kubek (150g)', 1.5, 8, 12, 0.3, 0.1, 'Skyr z dodatkiem owoców.'],
    ['Jogurt owocowy', '🍓', 'nabial', 'kubek (150g)', 1.5, 3, 14, 2.5, 1.6, 'Jogurt z owocami i cukrem.'],
    ['Jogurt pitny', '🥤', 'nabial', 'butelka (200ml)', 2, 3, 10, 2, 1.3, 'Jogurt do picia.'],
    ['Jogurt pitny białkowy', '🥤', 'nabial', 'butelka (200ml)', 2, 8, 8, 2, 1.3, 'Pitny jogurt z dodatkiem białka.'],
    ['Serek wiejski', '🥣', 'nabial', 'opakowanie (200g)', 2, 11, 3, 4, 2.5, 'Twarożek ziarnisty w śmietance.'],
    ['Serek wiejski lekki', '🥣', 'nabial', 'opakowanie (200g)', 2, 11, 3, 1.5, 1, 'Chudszy serek wiejski.'],
    ['Serek homogenizowany naturalny', '🍦', 'nabial', 'kubek (150g)', 1.5, 6, 14, 4, 2.6, 'Słodki serek homogenizowany.'],
    ['Serek homogenizowany waniliowy', '🍮', 'nabial', 'kubek (150g)', 1.5, 5.5, 16, 4.5, 2.8, 'Serek waniliowy deserowy.'],
    ['Serek homogenizowany truskawkowy', '🍓', 'nabial', 'kubek (150g)', 1.5, 5.5, 16, 4.5, 2.8, 'Serek o smaku truskawek.'],
    ['Serek kanapkowy naturalny', '🧀', 'nabial', 'łyżka (30g)', 0.3, 6, 3, 17, 10, 'Serek śmietankowy do smarowania.'],
    ['Serek kanapkowy ze szczypiorkiem', '🧀', 'nabial', 'łyżka (30g)', 0.3, 6, 3, 17, 10, 'Serek kremowy ze szczypiorkiem.'],
    ['Serek typu philadelphia', '🧀', 'nabial', 'łyżka (30g)', 0.3, 7, 4, 22, 13, 'Kremowy serek amerykański.'],
    ['Ricotta', '🧀', 'nabial', 'łyżka (50g)', 0.5, 11, 3, 11, 7, 'Włoski ser z serwatki.'],
    ['Jogurt wiejski naturalny', '🥛', 'nabial', 'kubek (150g)', 1.5, 3.5, 5, 3.5, 2.2, 'Jogurt typu skyr wiejski.'],
    ['Mleko skondensowane słodzone', '🥫', 'nabial', 'łyżka (20g)', 0.2, 8, 54, 8, 5, 'Zagęszczone mleko z cukrem.'],
    ['Mleko skondensowane niesłodzone', '🥫', 'nabial', 'łyżka (20g)', 0.2, 6, 10, 7, 4.5, 'Zagęszczone mleko bez cukru.'],
    ['Mleko smakowe czekoladowe', '🍫', 'nabial', 'kubek (250ml)', 2.5, 3.3, 10, 1.5, 1, 'Mleko z dodatkiem kakao i cukru.'],
    ['Mleko smakowe waniliowe', '🍮', 'nabial', 'kubek (250ml)', 2.5, 3.2, 9.5, 1.5, 1, 'Mleko o smaku wanilii.'],
    ['Kakao na mleku (gotowe)', '🍫', 'nabial', 'kubek (250ml)', 2.5, 3, 9, 1.3, 0.8, 'Kakao instant na mleku.'],
    ['Napój proteinowy (mleczny)', '🥤', 'nabial', 'butelka (250ml)', 2.5, 8, 6, 1.5, 1, 'Napój mleczny wzbogacony białkiem.'],
    ['Białko serwatkowe shake (mleko)', '🥤', 'nabial', 'shaker (250ml)', 2.5, 24, 10, 3, 2, 'Shake z odżywką na mleku.'],
    ['Śmietana ukwaszona 12%', '🥛', 'nabial', 'łyżka (30g)', 0.3, 3, 4, 12, 8, 'Ukwaszona śmietana do zup.'],
    ['Jogurt z miodem i orzechami', '🍯', 'nabial', 'kubek (150g)', 1.5, 5, 12, 4, 2, 'Jogurt grecki z miodem.'],
/*__DATA__*/
];

function slugify(name) {
    return String(name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function r1(n) { return Math.round(n * 10) / 10; }

function build(row) {
    const [name, emoji, category, servingText, servingRatio, protein, carbs, fat, satFat, extra] = row;
    const kcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
    const sat = r1(satFat);
    const unsat = r1(Math.max(0, fat - satFat));
    const o = {
        name,
        emoji,
        category,
        servingText,
        servingRatio,
        kcal,
        protein: r1(protein),
        carbs: r1(carbs),
        fat: r1(fat),
        satFat: sat,
        unsatFat: unsat
    };
    if (extra) o.extra = extra;
    return o;
}

function loadDb() {
    const raw = fs.readFileSync(rawPath, 'utf8');
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf('];');
    const products = JSON.parse(raw.slice(start, end + 1));
    return { raw, start, end, products };
}

const { raw, start, end, products: db } = loadDb();

const names = new Set(db.map((p) => String(p.name || '').trim().toLowerCase()));
const slugs = new Set(db.map((p) => String(p.slug || '')));
const incoming = [];
const dupes = [];
const badCat = [];
const macroWarn = [];
const seen = new Set();

for (const row of NEW) {
    if (!row || !row[0]) continue;
    const name = row[0];
    const lower = name.trim().toLowerCase();
    if (names.has(lower)) { dupes.push(`${name} (już w bazie)`); continue; }
    if (seen.has(lower)) { dupes.push(`${name} (duplikat w pliku)`); continue; }
    if (!CAT.has(row[2])) { badCat.push(`${name} → ${row[2]}`); continue; }
    seen.add(lower);

    const p = build(row);
    // unikalny slug
    let base = slugify(p.name);
    let slug = base;
    let n = 2;
    while (slugs.has(slug)) slug = `${base}-${n++}`;
    slugs.add(slug);
    p.slug = slug;

    // kontrola spójności makro (kcal wg makro, sat+unsat <= fat)
    if (p.satFat + p.unsatFat > p.fat + 0.65) {
        macroWarn.push(`${p.name}: sat+unsat ${(p.satFat + p.unsatFat).toFixed(1)} > fat ${p.fat}`);
    }

    incoming.push(p);
}

const byCat = {};
for (const p of incoming) byCat[p.category] = (byCat[p.category] || 0) + 1;

console.log(`Kandydatów: ${NEW.length} | do dopisania: ${incoming.length} | baza: ${db.length} → ${db.length + incoming.length}`);
console.log('Rozkład:', Object.keys(byCat).map((c) => `${c}=${byCat[c]}`).join(' '));
if (dupes.length) console.log(`DUPLIKATY (${dupes.length}):\n  ` + dupes.join('\n  '));
if (badCat.length) console.log(`ZŁE KATEGORIE (${badCat.length}):\n  ` + badCat.join('\n  '));
if (macroWarn.length) console.log(`OSTRZEŻENIA MAKRO (${macroWarn.length}):\n  ` + macroWarn.join('\n  '));

if (!process.argv.includes('--write')) {
    console.log('\nDry-run. Dodaj --write aby zapisać.');
    process.exit(0);
}

if (dupes.length || badCat.length) {
    console.error('\nPrzerwano: popraw duplikaty/złe kategorie.');
    process.exit(1);
}

const next = [...db, ...incoming];
const out = raw.slice(0, start) + JSON.stringify(next) + raw.slice(end + 1);
const tmp = rawPath + '.tmp';
fs.writeFileSync(tmp, out, 'utf8');
fs.renameSync(tmp, rawPath);
console.log(`\nZapisano. Baza: ${db.length} → ${next.length}`);
