/**
 * Scalanie drugiej paczki ręcznych opisów do product-editorial.json
 * node scripts/merge-editorial-batch2.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batch2 = {
  "jablko": {
    "title": "Jabłko — przekąska, nie białko",
    "paragraphs": [
      "Jabłko (ok. 52 kcal, 0,3 g białka na 100 g) to owoc do węglowodanów i błonnika, nie do proteinów. Jedno średnie jabłko (150 g) to ~78 kcal — wygodne na przekąskę między posiłkami.",
      "Zielone jabłka są bardziej kwaskowe i nieco mniej słodkie niż czerwone Golden. Z pestkami i skórką dostajesz więcej błonnika; bez skórki — mniej, ale łatwiej jeść dzieciom.",
      "Jabłko z masłem orzechowym to syty snack, ale pamiętaj o porcji pasty — sama owocowość nie zrobi sytości na długo."
    ]
  },
  "jajecznica-na-masle": {
    "title": "Jajecznica — szybkie białko rano",
    "paragraphs": [
      "Jajecznica na maśle (ok. 168 kcal, 11 g białka na 100 g) łączy białko z jaj z tłuszczem z masła. Trzy jajka na patelni to często 200+ kcal samego dania — zależy, ile masła użyjesz.",
      "Wersja na oliwie lub sprayu jest lżejsza; dodatek szpinaku, pomidorów lub szynki podbija objętość bez dużej liczby kcal. Jajecznica z samym chlebem to śniadanie, które warto domknąć białkiem (więcej jaj lub twaróg obok).",
      "Gotuj na małym ogniu i mieszaj — wtedy wychodzi kremowa, a nie gumowata."
    ]
  },
  "omlet": {
    "title": "Omlet — elastyczne śniadanie",
    "paragraphs": [
      "Omlet (ok. 154 kcal, 11 g białka na 100 g) to jajka roztrzepane i usmażone — kalorie rosną z dodatkiem sera, boczku i oleju na patelni. Omlet z 3 jaj i 30 g sera to często 350–400 kcal.",
      "Nadzienie warzywne (papryka, cukinia, pieczarki) zwiększa objętość talerza przy niewielkim wzroście kcal. Omlet owocowy z bananem to już deser — licz owoce osobno.",
      "Na redukcji omlet sprawdza się lepiej niż croissant z masłem — więcej białka przy podobnej sytości, jeśli nie przesadzisz z dodatkami."
    ]
  },
  "sernik-kawalek": {
    "title": "Sernik — deser z twarogu",
    "paragraphs": [
      "Sernik (ok. 320 kcal, 6 g białka na 100 g) to ciasto z twarogu, jaj i cukru — białka jest więcej niż w czystym cieście, ale dominują węgle i tłuszcz. Kawałek 120 g to ~380 kcal.",
      "Domowy sernik na jogurcie greckim i z mniejszą ilością cukru ma inne makro niż kawiorniany z polewą czekoladową. Krój cienko, jeśli chcesz zjeść kawałek „na diecie”.",
      "Sernik nie zastąpi twarogu chudego jako źródła białka — to deser, nie posiłek proteinowy."
    ]
  },
  "makowiec": {
    "title": "Makowiec — świąteczny kaloryczny klasyk",
    "paragraphs": [
      "Makowiec (ok. 380 kcal, 7 g białka na 100 g) to ciasto drożdżowe z makiem — gęste kalorycznie przez mak, cukier i masło. Kawałek 80–100 g to często 300–380 kcal.",
      "W okresie świątecznym jeden kawałek dziennie przez tydzień może zatrzymać wagę mimo deficytu w reszcie roku. Planuj z góry — wpisz kawałek do dnia, zamiast „jakoś się ułoży”.",
      "Mak zawiera też wapń i błonnik, ale przy takiej kaloryczności to raczej przyjemność niż „zdrowy produkt”."
    ]
  },
  "lody-waniliowe": {
    "title": "Lody waniliowe — lato i kalorie",
    "paragraphs": [
      "Lody waniliowe (ok. 207 kcal, 3,5 g białka na 100 g) to cukier, mleko i tłuszcz — mało proteinów. Dwie kulki (100 g) to ~207 kcal; rożek z waflem i polewą znacznie więcej.",
      "Lody „proteinowe” z marketu bywają gęstsze w białku, ale też droższe — sprawdź etykietę, nie tylko front opakowania. Klasyczne lody to okazjonalny deser, nie codzienny element diety.",
      "W upały łatwo zjeść 300 g podczas spaceru — to 600+ kcal bez uczucia „zjedzenia obiadu”."
    ]
  },
  "zelki": {
    "title": "Żelki — cukier w małej paczce",
    "paragraphs": [
      "Żelki (ok. 320 kcal, 5 g białka na 100 g) to głównie cukier i syrop glukozowy — białko pochodzi z żelatyny, ale go jest mało. Paczka 100 g znika szybko, a to 320 kcal.",
      "Żelki „bez cukru” mają maltitol lub inne substancje — mniej kcal, ale mogą „robić robotę” jelitom przy większej porcji. Czytaj skład, nie tylko hasło na opakowaniu.",
      "Dzieci i dorośli jedzą je z nudów — jeśli masz paczkę w szafce, trudniej trzymać deficyt wieczorem."
    ]
  },
  "czekolada-mleczna": {
    "title": "Czekolada mleczna — słodycz na co dzień",
    "paragraphs": [
      "Czekolada mleczna (ok. 535 kcal, 7 g białka na 100 g) ma dużo cukru i tłuszczu kakaowego. Dwie kostki (20 g) to ~107 kcal — rozsądna porcja; pół tabliczki „przy herbacie” to już 250+ kcal.",
      "Gorzka czekolada ma więcej kakao i często mniej cukru, ale też wysoką kaloryczność na 100 g. Mleczna smakuje łagodniej — łatwiej zjeść więcej niż planowałeś.",
      "Na redukcji czekolada może zostać w planie jako mała przekąska po obiedzie — o ile reszta dnia jest policzona."
    ]
  },
  "hot-dog": {
    "title": "Hot dog — ulica i stadion",
    "paragraphs": [
      "Hot dog (ok. 290 kcal, 10 g białka na 100 g) to parówka w bułce z dodatkami — sama parówka to część białka, reszta to bułka i sos. Sztuka 150 g to ~435 kcal.",
      "Ketchup, musztarda i prażona cebula dokładają cukier i tłuszcz. Wersja domowa z dobrej parówki i pełnoziarnistej bułki ma inne makro niż budka na meczu.",
      "Raz na jakiś czas w deficycie OK; codzienny hot dog na lunch szybko psuje bilans tygodnia."
    ]
  },
  "cheeseburger": {
    "title": "Cheeseburger — ser i kotlet",
    "paragraphs": [
      "Cheeseburger (ok. 263 kcal, 13 g białka na 100 g) to kotlet, ser, bułka i sos — więcej tłuszczu niż zwykły hamburger przez ser. Porcja 150 g to ~395 kcal.",
      "Podwójny cheeseburger w fast foodzie ma osobny wpis w bazie — nie myl z pojedynczym. Domowy z chudą wołowiną 5% i jednym plasterkiem sera bywa lżejszy.",
      "Porównaj z Big Maciem i kurczakiem grillowanym w tej samej kategorii — różnica w kcal na 100 g bywa spora."
    ]
  },
  "mcchicken-kurczak-w-panierce": {
    "title": "Kurczak w panierce — fast food",
    "paragraphs": [
      "McChicken / kurczak w panierce (ok. 250 kcal, 14 g białka na 100 g) to filet w bułce z sosem — panierka i majonez podbijają tłuszcz względem samego kurczaka grillowanego.",
      "Sztuka ~150 g to ~375 kcal. Bez sosu i z sałatką zamiast frytek obcinasz sporo kalorii przy tym samym „fast foodowym” posiłku.",
      "Grillowana pierś z kurczaka w domu daje więcej białka przy mniejszej liczbie kcal — panierka to głównie węgle i tłuszcz."
    ]
  },
  "frytki-z-serem-loaded": {
    "title": "Loaded fries — frytki z serem",
    "paragraphs": [
      "Frytki z serem (ok. 280 kcal, 8 g białka na 100 g) to frytki plus roztopiony ser, często sos i bekon — znacznie więcej kcal niż same frytki. Porcja 200 g to ~560 kcal.",
      "To danie „do dzielenia”, które często zjada jedna osoba. Ser i sos to ukryte kalorie — nawet jeśli frytki wyglądają na główny składnik.",
      "Na imprezie traktuj jako dodatek do posiłku z białkiem, nie jako obiad sam w sobie."
    ]
  },
  "wrap-z-kurczakiem": {
    "title": "Wrap z kurczakiem — tortilla zamiast bułki",
    "paragraphs": [
      "Wrap z kurczakiem (ok. 210 kcal, 13 g białka na 100 g) często wydaje się lżejszy niż burger, ale duża tortilla plus sos potrafią dorównać kaloryczności. Sztuka 250 g to ~525 kcal.",
      "Wersja domowa: cienka tortilla, grillowany kurczak, dużo sałaty, sos osobno — wtedy kontrolujesz makro. W kebabie i wrapach z sieciówek porcje bywają większe niż myślisz.",
      "Porównaj z kebabem w cieście — czasem wrap ma mniej węgli, ale podobnie dużo tłuszczu z sosu."
    ]
  },
  "pierogi-z-miesem": {
    "title": "Pierogi z mięsem",
    "paragraphs": [
      "Pierogi z mięsem (ok. 195 kcal, 9 g białka na 100 g) mają więcej białka niż ruskie dzięki farszowi mięsnemu. Porcja 8 sztuk (280 g) to ~546 kcal i 25 g białka — syty obiad.",
      "Smażone na maśle po ugotowaniu podwajają kalorie względem gotowanych. Ze skwarkami i cebulką — jeszcze więcej.",
      "Mrożone pierogi z marketu mają podobne makro na etykiecie — zawsze licz wagę porcji po ugotowaniu."
    ]
  },
  "pierogi-z-kapusta-i-grzybami": {
    "title": "Pierogi z kapustą i grzybami",
    "paragraphs": [
      "Pierogi z kapustą i grzybami (ok. 165 kcal, 5 g białka na 100 g) są lżejsze niż z mięsem — głównie ciasto i nadzienie warzywne. Wigilijna klasyka, ale nie posiłek wysokobiałkowy.",
      "Dołożenie twarogu, jajka lub chudego mięsa obok podnosi białko całego posiłku. Smażone na Wigilię w maśle — inna historia kaloryczna niż gotowane.",
      "Na redukcji licz porcję — 10 pierogów „na oko” to często 500+ kcal."
    ]
  },
  "golabki": {
    "title": "Gołąbki — kapusta i mięso",
    "paragraphs": [
      "Gołąbki (ok. 118 kcal, 6 g białka na 100 g) to kapusta, ryż i mięso — syte, ale umiarkowane w białku. Porcja 300 g to ~354 kcal; sos pomidorowy i śmietana dokładają energię.",
      "Domowe gołąbki z chudym mielonym i dużą ilością kapusty są lżejsze niż wersja z tłustą kiełbasą w farszu. Zostają dobrze na drugi dzień — smak często lepszy.",
      "Łącz z surówką z marchewki zamiast chleba — więcej objętości przy podobnych kcal."
    ]
  },
  "grochowka": {
    "title": "Grochówka — wojskowy obiad",
    "paragraphs": [
      "Grochówka (ok. 88 kcal, 6 g białka na 100 g) to groch, wędlina i warzywa — tania i sycąca zupa. Miska 400 g to ~352 kcal; z chlebem i skwarkami znacznie więcej.",
      "Groch sam w sobie ma błonnik i roślinne białko — warto łączyć z chudym mięsem w daniu. Wersja z boczkiem i kiełbasą ma więcej tłuszczu nasyconego.",
      "Świetna na zimę i meal prep — zamrażanie nie psuje smaku, o ile dobrze podgrzewasz."
    ]
  },
  "zurek": {
    "title": "Żurek — zakwas i jajko",
    "paragraphs": [
      "Żurek (ok. 58 kcal, 3,5 g białka na 100 g) na pierwszy rzut oka wygląda lekko, ale biała kiełbasa, boczek i śmietana w garnku robią różnicę. Miska 350 g z jajkiem i kiełbasą to często 400–500 kcal.",
      "W restauracji porcje bywają ogromne — podziel się lub zostaw resztę. Domowy żurek na chudym rosole i z jednym jajkiem na misę łatwiej policzyć.",
      "Tradycyjne śniadanie wielkanocne raz w roku nie psuje roku — codzienny żurek już tak."
    ]
  },
  "kapusniak": {
    "title": "Kapuśniak — lekka zupa",
    "paragraphs": [
      "Kapuśniak (ok. 52 kcal, 2,5 g białka na 100 g) to kapusta, warzywa korzeniowe i bulion — jedna z lżejszych zup w polskiej kuchni. Duża miska 400 g to ~208 kcal przed dodaniem śmietany.",
      "Z kiełbasą i ziemniakami kalorie rosną — to już pełny obiad, nie „zupa dietetyczna”. Na redukcji kapuśniak z chudym mięsem to sposób na syty posiłek przy niskiej gęstości kalorycznej.",
      "Dobrze gęstnieje — na drugi dzień smak jest pełniejszy przy tym samym makro."
    ]
  },
  "rosol-z-makaronem": {
    "title": "Rosół z makaronem",
    "paragraphs": [
      "Rosół z makaronem (ok. 45 kcal, 3 g białka na 100 g) w samej zupie jest lekki — kalorie dokłada makaron, ziemniaki i mięso z talerza. Miska z makaronem 400 g to ~180 kcal zupy; z kurczakiem z nogi dorzucasz białko osobno.",
      "Bulion domowy z marchewką i pietruszką ma więcej smaku niż kubek instant — i zwykle mniej soli. Makaron w rosołe waż po ugotowaniu, jeśli liczysz dokładnie.",
      "Rosół to comfort food — na chorobę i po treningu, niekoniecznie źródło proteinów sam w sobie."
    ]
  },
  "kasza-gryczana": {
    "title": "Kasza gryczana — polski superfood",
    "paragraphs": [
      "Kasza gryczana sucha (ok. 343 kcal, 13 g białka na 100 g) po ugotowaniu ma niższe kcal na 100 g przez wodę. To pełnoziarniste źródło węglowodanów z błonnikiem i trochę białka roślinnego.",
      "Gryczana z jajkiem i duszoną cebulką to klasyk — białko z jaja domyka posiłek. Na redukcji mierz kaszę po ugotowaniu lub waż suchą przed gotowaniem.",
      "Bez glutenu — dobra alternatywa dla osób z celiakią zamiast makaronu pszennego."
    ]
  },
  "ziemniaki": {
    "title": "Ziemniaki — węgle do obiadu",
    "paragraphs": [
      "Ziemniaki surowe (ok. 77 kcal, 2 g białka na 100 g) to skrobia i potas — niewiele białka. Po ugotowaniu profil jest podobny; frytki i chipsy to już inna kategoria kaloryczna.",
      "Ziemniaki gotowane w mundurkach mają więcej błonnika niż obrane. Oziębione ziemniaki (np. sałatka na drugi dzień) mają nieco inny profil skrobi — część osób czuje dłuższą sytość.",
      "Łącz z kurczakiem, jajkiem lub twarogiem — sam ziemniak nie zbuduje posiłku wysokobiałkowego."
    ]
  },
  "ziemniaki-gotowane": {
    "title": "Ziemniaki gotowane",
    "paragraphs": [
      "Ziemniaki gotowane (ok. 87 kcal, 2 g białka na 100 g) to prosta baza obiadu. Średni ziemniak 150 g to ~130 kcal — dwie sztuki to już solidna porcja węglowodanów.",
      "Do gotowanych ziemniaków masło, śmietana lub frytka z patelni szybko podwaja kalorie. Z kefirem, twarogiem lub pieczonym kurczakiem — zbilansowany obiad.",
      "Mierz po ugotowaniu, jeśli wpisujesz do dziennika — waga surowa i gotowa się różni."
    ]
  },
  "bulka-pszenna": {
    "title": "Bułka pszenna",
    "paragraphs": [
      "Bułka pszenna (ok. 265 kcal, 8 g białka na 100 g) to ok. 265 kcal na standardową bułkę 100 g — głównie węglowodany. Z parówką, serem lub jajkiem robi się pełne śniadanie.",
      "Bułka grahamka lub razowa ma więcej błonnika i często niższy indeks glikemiczny — sprawdź skład, nie tylko kolor skórki.",
      "Tostowanie nie zmienia makro, ale poprawia smak — masło po tostowaniu licz osobno."
    ]
  },
  "bulka-z-parowka": {
    "title": "Bułka z parówką — szybki lunch",
    "paragraphs": [
      "Bułka z parówką (ok. 265 kcal, 11 g białka na 100 g) to szkolny i biurowy klasyk. Jedna sztuka ~120 g to ~318 kcal — z ketchupem i musztardą więcej.",
      "Parówka z kurczaka bywa chudsza niż wieprzowa, ale nadal wędlina z solą. Z domowym grillowanym kurczakiem w bułce masz lepsze makro.",
      "Na redukcji można zjeść, jeśli mieści się w planie — problem zaczyna się przy codziennym „z braku czasu”."
    ]
  },
  "migdaly": {
    "title": "Migdały — orzechy w diecie",
    "paragraphs": [
      "Migdały (ok. 579 kcal, 21 g białka na 100 g) mają dużo białka jak na roślinę, ale jeszcze więcej tłuszczu — gęsto kaloryczne. Garść 30 g to ~174 kcal i 6 g białka.",
      "Migdały w całości wolniej się jedzą niż mąka migdałowa w deserach — trudniej przesadzić z porcją. Prażone bez soli to lepszy wybór niż w karmelu.",
      "Masło migdałowe to te same migdały w formie łatwej do przedawkowania — mierz łyżką."
    ]
  },
  "orzechy-wloskie": {
    "title": "Orzechy włoskie",
    "paragraphs": [
      "Orzechy włoskie (ok. 654 kcal, 15 g białka na 100 g) to jedne z najbardziej kalorycznych przekąsek w bazie. Garść 25 g to ~163 kcal — „dla zdrowia” łatwo zjeść 100 g (650 kcal).",
      "Zawierają kwasy omega-3 w formie roślinnej (ALA) — wartościowe w diecie, ale nie zastępują ryb. Do owsianki i sałatek dodawaj na wadze.",
      "Przechowuj w lodówce — tłuszcz w orzechach może jełczeć przy cieple."
    ]
  },
  "granola": {
    "title": "Granola — zdrowa na etykiecie",
    "paragraphs": [
      "Granola (ok. 471 kcal, 10 g białka na 100 g) to płatki, orzechy, olej i często miód — kalorycznie zbliżona do chipsów, tylko z błonnikiem. Miska 60 g z jogurtem to ~280 kcal samej granoli.",
      "„Fit” granole z marketu często mają tyle samo cukru co zwykłe — czytaj etykietę na 100 g. Owsianka na wodzie z owocami bywa lżejsza i tańsza.",
      "Jako topping dodawaj łyżkę, nie pełną miskę."
    ]
  },
  "izolat-bialka-wpi": {
    "title": "Izolat białka (WPI)",
    "paragraphs": [
      "Izolat białka serwatkowego (ok. 85 g białka, 360 kcal na 100 g proszku) to najczystsza forma whey — mniej laktozy i tłuszczu niż koncentrat. Porcja 30 g to ~25 g białka i ~108 kcal.",
      "Droższy niż WPC i twaróg, ale wygodny po treningu lub w podróży. Nie zastępuje posiłków — brak błonnika i sytości z jedzenia.",
      "Rozpuść w wodzie, żeby obciąć kalorie z mleka; mleko dodaje białko i kcal."
    ]
  },
  "koncentrat-bialka-serwatkowego-wpc": {
    "title": "Koncentrat białka (WPC)",
    "paragraphs": [
      "Koncentrat serwatkowy WPC (ok. 75 g białka, 352 kcal na 100 g) to najpopularniejsza odżywka — tańszy niż izolat, z odrobiną laktozy i tłuszczu. Porcja 30 g to ok. 22 g białka.",
      "Smaki czekoladowe i waniliowe mają dodatki cukru — sprawdź etykietę producenta. Naturalny WPC do jogurtu lub owsianki daje kontrolę nad słodkością.",
      "Porównaj cenę za 100 g białka z twarogiem — często twaróg wygrywa, odżywka wygrywa na wygodzie."
    ]
  },
  "mleko-3-2": {
    "title": "Mleko 3,2%",
    "paragraphs": [
      "Mleko 3,2% (ok. 64 kcal, 3,3 g białka na 100 g) to więcej tłuszczu niż mleko 2%, trochę więcej smaku. Szklanka 250 ml to ~8 g białka i 160 kcal.",
      "Do kawy i owsianki mleko 3,2% dodaje kremowości — łatwo pić 500 ml dziennie „nie licząc”. Na redukcji 2% lub bez laktozy bywa wystarczające.",
      "Mleko roślinne ma inne makro — sojowe jest bliższe białkowo, owsiane zwykle ma go mało."
    ]
  },
  "jogurt-naturalny": {
    "title": "Jogurt naturalny",
    "paragraphs": [
      "Jogurt naturalny (ok. 60 kcal, 4,3 g białka na 100 g) to lżejsza opcja niż skyr czy twaróg, ale dobry bazowy nabiał. Kubek 200 g to ~8,6 g białka.",
      "Wersje owocowe z dodatkiem cukru mają inne makro — zawsze porównuj etykietę. Naturalny z owocami i odrobiną miodu daje kontrolę nad słodkością.",
      "Jogurt pitny jest rzadszy — mniej syty, podobne kcal na 100 ml."
    ]
  },
  "szpinak-swiezy": {
    "title": "Szpinak świeży",
    "paragraphs": [
      "Szpinak świeży (ok. 23 kcal, 2,9 g białka na 100 g) to warzywo liściaste — dużo objętości przy małej liczbie kalorii. 200 g sałatki to ~46 kcal.",
      "Żelazo ze szpinaku przyswaja się lepiej z witaminą C (pomidor, papryka). Na patelnię szpinak „siada” — 300 g świeżego to po duszeniu garść.",
      "Mrożony szpinak do smoothie i omletów jest wygodny — makro podobne do świeżego."
    ]
  },
  "pomidor": {
    "title": "Pomidor — baza sałatki",
    "paragraphs": [
      "Pomidor (ok. 18 kcal, 0,9 g białka na 100 g) to woda, likopen i niewiele kalorii. Średni pomidor 120 g to ~22 kcal — możesz jeść dużo bez psucia deficytu.",
      "Pomidory koktajlowe są słodsze — kalorie podobne, łatwiej zjeść więcej sztuk. Koncentrat pomidorowy i ketchup to już inna gęstość kaloryczna.",
      "Z oliwą i mozzarellą (caprese) licz dodatki — sam pomidor jest lekki."
    ]
  },
  "ogorek": {
    "title": "Ogórek — chrupkość bez kcal",
    "paragraphs": [
      "Ogórek (ok. 14 kcal, 0,7 g białka na 100 g) to jeden z najlżejszych warzyw w bazie. Cały średni ogórek 300 g to ~42 kcal — idealny do objętości sałatki.",
      "Ogórek kiszony ma sól i czasem cukier w zalewie — makro inne niż świeży. Z tzatziki i śmietaną rośnie kaloryczność porcji.",
      "Chrupie z hummusem — pamiętaj o porcji pasty, nie samego ogórka."
    ]
  },
  "marchew": {
    "title": "Marchew — beta-karoten",
    "paragraphs": [
      "Marchew (ok. 41 kcal, 0,9 g białka na 100 g) to warzywo korzeniowe z beta-karotenem. Surowa w surówce vs gotowana z odrobiną tłuszczu — tłuszcz poprawia wchłanianie witamin rozpuszczalnych w tłuszczach.",
      "Marchew w soku to cukry bez błonnika z owocu — łatwiej wypić dużo kcal niż zjeść kilka marchewek. Surówka z jabłkiem i olejem rzepakowym — licz olej.",
      "Na redukcji marchew to filler do obiadu — dużo gryzienia, mało kcal."
    ]
  },
  "brokuly": {
    "title": "Brokuły — warzywo do meal prep",
    "paragraphs": [
      "Brokuły (ok. 34 kcal, 3 g białka na 100 g) to klasyk diety redukcyjnej — dużo objętości, mało kalorii, trochę błonnika. 200 g to ~68 kcal.",
      "Gotowanie długie w wodzie wypłukuje witaminy — para lub krótkie blanszowanie jest lepsze. Brokuły z serem cheddar na patelni szybko stają się kaloryczne.",
      "Mrożone brokuły do obiadu z kurczakiem i ryżem to szybki meal prep bez psucia makro."
    ]
  },
  "losos-wedzony": {
    "title": "Łosoś wędzony",
    "paragraphs": [
      "Łosoś wędzony (ok. 117 kcal, 18 g białka na 100 g) to białko i omega-3 przy umiarkowanej kaloryczności — więcej soli niż u świeżego fileta. Plastry na kanapce z twarogiem to śniadanie wysokobiałkowe.",
      "100 g plastrów to ok. 18 g białka — wygodne, ale droższe niż kurczak. Nie myl z łososiem atlantyckim świeżym — wędzony ma inny profil soli i często cukru w glazurze.",
      "Na kanapce z bagietką licz też pieczywo — sam łosoś nie robi całego makro posiłku."
    ]
  },
  "makrela-wedzona": {
    "title": "Makrela wędzona",
    "paragraphs": [
      "Makrela wędzona (ok. 262 kcal, 18 g białka na 100 g) jest kaloryczniejsza niż łosoś wędzony przez tłuszcz ryby — ale też omega-3. Puszka lub filet na sałatkę to szybkie białko.",
      "Sól i wędzenie — nie jedz codziennie w dużych ilościach. Połówka fileta z ziemniakami i surówką to tradycyjny obiad.",
      "Porównaj z tuńczykiem w wodzie, jeśli liczysz kalorie — tuńczyk jest chudszy."
    ]
  },
  "sledz-marynowany": {
    "title": "Śledź marynowany",
    "paragraphs": [
      "Śledź marynowany (ok. 190 kcal, 18 g białka na 100 g) to ryba z olejem i octem w marynacie — dobre białko, sporo tłuszczu z ryby i oleju. Filet 100 g to ok. 18 g proteinów.",
      "Na święta i imprezy łatwo zjeść 200 g z cebulą i chlebem — policz cały posiłek. Śledź w oleju z puszki ma jeszcze więcej kcal.",
      "Źródło witaminy D i omega-3 — wartościowe, ale porcja ma znaczenie."
    ]
  },
  "halibut": {
    "title": "Halibut — chuda biała ryba",
    "paragraphs": [
      "Halibut (ok. 91 kcal, 19 g białka na 100 g) to chude białko z morza — podobny profil do dorsza. Filet 150 g to ~28 g białka przy ~137 kcal przed dodaniem masła na patelni.",
      "Mięso jest delikatne — krótkie pieczenie lub para. Halibut bywa drogi — dorsz i mintaj są tańszymi zamiennikami makro.",
      "Ryba pieczona z cytryną i ziołami to najprostszy sposób na kontrolę kalorii."
    ]
  },
  "fladra": {
    "title": "Flądra — ryba na patelnię",
    "paragraphs": [
      "Flądra (ok. 70 kcal, 15 g białka na 100 g) to chuda ryba popularna w polskich sklepach. Smażona w panierce ma inne makro niż sama ryba — panierka i olej to osobne kalorie.",
      "Filet na parze z ziemniakami i marchewką to lekki obiad. Porcja 200 g ryby to ~30 g białka przy ~140 kcal.",
      "Świeża vs mrożona — makro podobne; odmrażaj w lodówce, nie w mikrofalówce na gorąco."
    ]
  },
  "kabanosy": {
    "title": "Kabanosy — przekąska kaloryczna",
    "paragraphs": [
      "Kabanosy (ok. 450 kcal, 25 g białka na 100 g) mają dużo białka jak na wędlinę, ale też dużo tłuszczu i soli. Jedna sztuka 30 g to ~135 kcal — „tylko kabanos” szybko się sumuje.",
      "Na wycieczce i w pracy wygodne, ale przetworzone mięso nie powinno być podstawą białka. Lepszy wybór na co dzień: kurczak, twaróg, jajka.",
      "Kabanosy drobiowe bywają chudsze — sprawdź etykietę, nie tylko kolor opakowania."
    ]
  },
  "kielbasa-parowkowa": {
    "title": "Kiełbasa parówkowa",
    "paragraphs": [
      "Kiełbasa parówkowa (ok. 260 kcal, 12 g białka na 100 g) to wędlina do grillowania i zupy — więcej tłuszczu niż chude mięso. Sztuka 80 g to ~208 kcal.",
      "Na grilla z majonezem i chlebem to pełny posiłek 500+ kcal. Kiełbasa w żurku i bigosie dokłada smak i kalorie do zupy.",
      "Wersje drobiowe i „light” mają mniej tłuszczu — warto porównać etykiety."
    ]
  },
  "schabowy-panierowany": {
    "title": "Kotlet schabowy",
    "paragraphs": [
      "Schabowy panierowany (ok. 260 kcal, 18 g białka na 100 g) to kotlet w panierce — więcej tłuszczu i węgli niż sam schab. Kotlet 150 g to ~39 g białka i ~390 kcal przed dodatkiem ziemniaków i surówki.",
      "Pieczony w piekarniku z minimalnym olejem jest lżejszy niż smażony w głębokim tłuszczu. Z cytryną i ziemniakami to polski klasyk — licz cały talerz.",
      "Schab bez panierki z piekarnika ma osobny profil w bazie — dużo chudszy."
    ]
  },
  "kotlet-mielony-wieprzowo-wolowy": {
    "title": "Kotlet mielony",
    "paragraphs": [
      "Kotlet mielony wieprzowo-wołowy (ok. 250 kcal, 17 g białka na 100 g) to mielone mięso z jajkiem i bułką tartą — kotlet 120 g to ~30 g białka. Smażony na oleju dokłada kcal.",
      "Z piekarnika z warzywami pod białym sosem — inna historia niż kotlet z frytkami. Mielone z indykiem jest chudsze przy podobnej wadze.",
      "Dzieci jedzą kotlety chętniej niż samą pierś — dla rodziny to praktyczny kompromis."
    ]
  },
  "kurczak-mielony": {
    "title": "Kurczak mielony",
    "paragraphs": [
      "Kurczak mielony (ok. 143 kcal, 19 g białka na 100 g) to chude mielone — dobre białko przy umiarkowanej kaloryczności. Klopsiki, pulpety i farsz do papryki z tego samego opakowania.",
      "Szybko wysycha — dodaj odrobinę bulionu lub cebuli zamiast tłuszczu. Porcja 150 g to ~28 g białka.",
      "Tańszy niż polędwica wołowa przy podobnym zastosowaniu w kuchni."
    ]
  },
  "penne-z-kurczakiem-i-brokulami": {
    "title": "Penne z kurczakiem i brokułami",
    "paragraphs": [
      "Penne z kurczakiem i brokułami (ok. 140 kcal, 11 g białka na 100 g) to gotowe danie z makaronu, mięsa i warzyw — sensowny balans na obiad. Porcja 350 g to ~49 g białka.",
      "Domowa wersja z pełnoziarnistym penne i małą ilością oliwy bywa lżejsza niż mrożona z sosu śmietanowego. Brokuły dodają objętości przy małej liczbie kcal.",
      "Meal prep na 2 dni — makaron lekko się sklei, smak zwykle OK po podgrzaniu."
    ]
  },
  "lasagne-z-miesem": {
    "title": "Lasagne z mięsem",
    "paragraphs": [
      "Lasagne z mięsem (ok. 160 kcal, 8 g białka na 100 g) to makaron, sos mięsny i ser — kaloryczne przez ser i bechamel. Porcja 300 g to ~480 kcal.",
      "Domowa lasagne z chudym mielonym i większą ilością sosu pomidorowego zamiast śmietanowego bywa lżejsza. Kawałek „na oko” z pieca to często 400+ kcal.",
      "Lasagne warzywna ma osobny wpis — mniej białka, mniej tłuszczu z mięsa."
    ]
  },
  "makaron-z-pesto-i-kurczakiem": {
    "title": "Makaron z pesto i kurczakiem",
    "paragraphs": [
      "Makaron z pesto i kurczakiem (ok. 195 kcal, 13 g białka na 100 g) — pesto z orzechów i oliwy szybko podbija tłuszcz. Porcja 350 g to ok. 45 g białka i ~680 kcal.",
      "Pesto z bazylii domowej z mniejszą ilością oliwy zmienia makro. Kurczak grillowany zamiast smażonego obcina tłuszcz.",
      "Danie restauracyjne często ma więcej oleju niż domowe — zakładaj wyższe kcal poza domem."
    ]
  },
  "bulgur-suchy": {
    "title": "Bulgur — kasza z pszenicy",
    "paragraphs": [
      "Bulgur suchy (ok. 342 kcal, 12 g białka na 100 g) gotuje się szybko — popularny w sałatkach i jako dodatek do mięsa. Po ugotowaniu kalorie na 100 g są niższe przez wodę.",
      "Sałatka tabbouleh z bulgurem, pomidorami i pietruszką to lekki obiad — oliwa w dressingu licz osobno. Bulgur z kurczakiem i warzywami to pełny meal prep.",
      "Zawiera gluten — nie dla osób z celiakią."
    ]
  },
  "kasza-jaglana": {
    "title": "Kasza jaglana",
    "paragraphs": [
      "Kasza jaglana sucha (ok. 378 kcal, 11 g białka na 100 g) po ugotowaniu jest delikatna i lekko orzechowa. Bez glutenu — dobra dla osób z wrażliwością na pszenicę.",
      "Jaglanka na mleku na śniadanie z owocami to węglowodany; z jajkiem i warzywami — bardziej wyważony posiłek. Waż suchą lub gotową konsekwentnie.",
      "Kasza jaglana z duszonym mięsem to klasyczny polski obiad."
    ]
  },
  "komosa-ryzowa-quinoa": {
    "title": "Quinoa — komosa ryżowa",
    "paragraphs": [
      "Quinoa sucha (ok. 368 kcal, 14 g białka na 100 g) to pseudozboże z kompletnym profilem aminokwasów — więcej białka niż ryż czy kasza gryczana. Po ugotowaniu rośnie objętość.",
      "Quinoa w sałatkach i bowlach z kurczakiem to modny meal prep — droższa niż ryż, ale więcej białka roślinnego. Płucz przed gotowaniem, żeby usunąć goryczkę.",
      "Porcja 80 g sucha to solidna baza obiadu po ugotowaniu."
    ]
  },
  "stripsy-z-kurczaka": {
    "title": "Stripsy z kurczaka",
    "paragraphs": [
      "Stripsy z kurczaka (ok. 280 kcal, 18 g białka na 100 g) to paski w panierce — podobne do nuggetsów, często z sosem. Porcja 150 g to ~42 g białka i ~420 kcal przed frytkami.",
      "Stripsy z piekarnika z panko i sprayem oleju są lżejsze niż smażone. Fast foodowe porcje z marketu mają etykietę — trzymaj się gramów z opakowania.",
      "Kurczak grillowany bez panierki daje więcej białka na kalorię."
    ]
  },
  "skrzydelka-kurze": {
    "title": "Skrzydełka kurze",
    "paragraphs": [
      "Skrzydełka kurze (ok. 186 kcal, 19 g białka na 100 g) mają skórę i tłuszcz — więcej kcal niż pierś, ale też smak z grilla. 200 g skrzydełek to ~37 g białka i ~372 kcal przed sosem BBQ.",
      "Usuń skórę po pieczeniu, jeśli chcesz obciąć tłuszcz — białko zostaje w mięsie. Skrzydełka w panierce (KFC styl) mają osobny wpis z wyższą kalorycznością.",
      "Na imprezie łatwo zjeść 500 g — policz przed kolejną rundą sosu."
    ]
  },
  "salatka-cezar-z-kurczakiem": {
    "title": "Sałatka Cezar z kurczakiem",
    "paragraphs": [
      "Sałatka Cezar (ok. 145 kcal, 10 g białka na 100 g) to sałata, kurczak, grzanki, parmezan i sos — sos i grzanki często ważą więcej niż kurczak. Miska 300 g w restauracji to 400–600 kcal.",
      "Domowa wersja: grillowany kurczak, sos jogurtowy zamiast majonezowego, mało grzanek — inne makro niż z dostawy. Sałatka nie jest automatycznie „lekką” opcją.",
      "Porównaj z sałatką grecką — tam więcej sera i oliwy, tu więcej sosu kremowego."
    ]
  },
  "hummus": {
    "title": "Hummus — pasta z ciecierzycy",
    "paragraphs": [
      "Hummus (ok. 166 kcal, 8 g białka na 100 g) to ciecierzyca, tahini i oliwa — roślinne białko z tłuszczem. Łyżka 30 g to ~50 kcal; zjedzenie pół opakowania z chlebem to 400+ kcal.",
      "Z warzywami (marchew, papryka) jako dip jest zdrowszy niż z białym chlebem w nieskończoność. Domowy hummus ma mniej soli niż sklepowy.",
      "Łącz z kurczakiem lub jajkiem, żeby podnieść białko posiłku."
    ]
  },
  "tahini-pasta-sezamowa": {
    "title": "Tahini — pasta sezamowa",
    "paragraphs": [
      "Tahini (ok. 595 kcal, 17 g białka na 100 g) to mielony sezam — gęste kalorycznie jak masło orzechowe. Łyżka 15 g to ~89 kcal; w hummusie i sosach łatwo nie zauważyć porcji.",
      "Bogate w wapń i tłuszcze nienasycone — wartościowe w małych ilościach. Do dressingu rozrzedzaj wodą lub cytryną, nie jedz łyżkami.",
      "Przechowuj w lodówce po otwarciu — olej może się rozdzielać, wymieszaj przed użyciem."
    ]
  },
  "maslo-ekstra-82": {
    "title": "Masło 82%",
    "paragraphs": [
      "Masło ekstra 82% (ok. 748 kcal, 0,7 g białka na 100 g) to prawie czysty tłuszcz — łyżka 10 g to ~75 kcal. Na patelnię, do pieczenia i na chleb szybko sumuje się w ciągu dnia.",
      "Do smażenia jaj i kotletów masło dodaje smaku, ale oliwa ma wyższą temperaturę dymienia. Na redukcji spray lub patelnia nieprzywierająca oszczędzają dziesiątki kalorii dziennie.",
      "Masło klarowane (ghee) ma mniej laktozy — makro podobne do masła."
    ]
  },
  "smietana-18": {
    "title": "Śmietana 18%",
    "paragraphs": [
      "Śmietana 18% (ok. 186 kcal, 2,5 g białka na 100 g) to lżejsza niż 30% — do zup, sosów i deserów. Łyżka 20 g do zupy to ~37 kcal; gdy zjesz zupę ze śmietaną i chlebem, licz wszystko.",
      "Śmietana 30% ma więcej tłuszczu i gęstsza konsystencja — w przepisach nie zamieniaj 1:1 bez przeliczenia kcal. Jogurt grecki często zastępuje śmietanę w dipach przy mniejszej liczbie kcal.",
      "Użyta w sosie do makaronu potrafi podwoić kaloryczność porcji."
    ]
  },
  "ketchup": {
    "title": "Ketchup — cukier do frytek",
    "paragraphs": [
      "Ketchup (ok. 112 kcal, 1,7 g białka na 100 g) to głównie pomidory i cukier — łyżka 15 g to ~17 kcal, ale przy frytkach i burgerze lejesz więcej niż myślisz.",
      "Ketchup bez dodatku cukru ma inne makro — sprawdź etykietę. Do mięsa i jaj daje smak przy małej porcji; jako „sos główny” dokłada głównie węgle.",
      "Sos pomidorowy do makaronu z bazy jest gęstszy — osobny wpis w bazie."
    ]
  },
  "majonez": {
    "title": "Majonez — tłuszcz w łyżce",
    "paragraphs": [
      "Majonez (ok. 680 kcal, 1,3 g białka na 100 g) to jajka i olej — bardzo gęsty kalorycznie. Łyżka 15 g to ~102 kcal; w sałatce jarzynowej i na kanapce łatwo użyć trzech łyżek.",
      "Majonez light ma mniej tłuszczu, często więcej cukru i składników. Jogurt z musztardą jako zamiennik w dipach obcina kalorie.",
      "Kebab, burger i sałatka cezar — majonez w sosie to ukryte kalorie."
    ]
  },
  "sos-czosnkowy": {
    "title": "Sos czosnkowy",
    "paragraphs": [
      "Sos czosnkowy (ok. 350 kcal, 1 g białka na 100 g) to majonez lub śmietana z czosnkiem — kaloryczny dodatek do pizzy, kebaba i frytek. Łyżka 20 g to ~70 kcal.",
      "Domowy z jogurtu greckiego, czosnku i ziół ma inne makro niż sklepowy w tubce. Na kebabie „z sosem” często jest go więcej niż łyżka.",
      "Jedz sos osobno lub poproś o mniej — kontrolujesz wtedy porcję."
    ]
  },
  "chipsy-ziemniaczane": {
    "title": "Chipsy ziemniaczane",
    "paragraphs": [
      "Chipsy ziemniaczane (ok. 536 kcal, 7 g białka na 100 g) to tłuszcz i sól — paczka 150 g to ~804 kcal, często zjedzona przed TV bez rejestrowania. „Zdrowe” chipsy z pieca bywają tylko nieco lżejsze.",
      "Porcja 30 g z opakowania rzadko wystarcza — jeśli otwierasz paczkę, przełóż od razu do miseczki. Z hummusem licz też pastę.",
      "Frytki i chipsy to ten sam problem — węgle i tłuszcz w małej objętości."
    ]
  },
  "croissant": {
    "title": "Croissant — masło w cieście",
    "paragraphs": [
      "Croissant (ok. 406 kcal, 8 g białka na 100 g) to ciasto francuskie z masłem — śniadanie z kawą to 300+ kcal w jednej sztuce. Z dżemem i masłem dokładasz kolejne kalorie.",
      "Croissant z szynką i serem (wytrawny) ma więcej białka niż słodki z czekoladą. Na redukcji rzadziej niż codziennie — łatwo zastąpić chlebem razowym z jajkiem.",
      "Świeży z piekarni smakuje lepiej niż mrożony z marketu — makro podobne."
    ]
  },
  "wieprzowina-schab-bez-kosci": {
    "title": "Schab wieprzowy",
    "paragraphs": [
      "Schab wieprzowy bez kości (ok. 143 kcal, 21 g białka na 100 g) to chude mięso z wieprzowiny — tańsze niż polędwica wołowa przy dobrym białku. Kotlet schabowy w panierce ma osobny, wyższy wpis kaloryczny.",
      "Pieczony w całości z ziołami i surówką to obiad dla kilku osób — waż porcję mięsa po pokrojeniu. Schab długo się piecze — nie przesuszaj.",
      "Białko podobne do kurczaka, smak inny — warto rotować w tygodniu."
    ]
  }
};

const mainPath = path.join(__dirname, 'product-editorial.json');
const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
let added = 0;
for (const [slug, entry] of Object.entries(batch2)) {
  if (!main[slug]) {
    main[slug] = entry;
    added++;
  }
}
fs.writeFileSync(mainPath, JSON.stringify(main, null, 2) + '\n', 'utf8');
console.log(`Dodano ${added} opisów. Razem w pliku: ${Object.keys(main).length}`);
