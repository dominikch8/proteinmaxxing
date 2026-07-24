// Kalkulator — wymaga productsDatabase (js/products-data.js)
function pickRandomN(items, count) {
            const pool = [...items];
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            return pool.slice(0, count);
        }

        function pickRandomSix(items) {
            return pickRandomN(items, 6);
        }

        function getShopPool(goal) {
            const skipCats = ['fastfood', 'slodycze', 'sosy', 'tluszcze'];

            if (goal === 'lose') {
                return productsDatabase.filter(p =>
                    p.kcal <= 100 && !skipCats.includes(p.category)
                );
            }
            if (goal === 'gain') {
                return productsDatabase
                    .filter(p => p.protein >= 8 && !skipCats.includes(p.category))
                    .sort((a, b) => {
                        const ra = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(a) : null;
                        const rb = typeof proteinPer100Kcal === 'function' ? proteinPer100Kcal(b) : null;
                        return (rb ?? -1) - (ra ?? -1);
                    })
                    .slice(0, 24);
            }
            return productsDatabase.filter(p =>
                !skipCats.includes(p.category) &&
                p.kcal >= 35 && p.kcal <= 170 &&
                p.fat <= 12 &&
                (p.protein >= 2 || p.carbs >= 4)
            );
        }

        function renderShopSuggestions(goal) {
            const shopTitle = document.getElementById('shopTitle');
            const sGrid = document.getElementById('shopGrid');
            const titles = {
                lose: '🥗 Produkty na redukcję (z bazy)',
                gain: '💪 Produkty na masę (z bazy)',
                maintain: '🍽️ Produkty do utrzymania wagi'
            };
            shopTitle.innerText = titles[goal] || titles.maintain;

            let pool = getShopPool(goal);
            if (pool.length < 6) pool = productsDatabase.filter(p => !['fastfood', 'slodycze'].includes(p.category));
            const picked = pickRandomSix(pool);

            sGrid.innerHTML = picked.map((p) => {
                const url = productPageUrl(p.slug);
                const title = `${p.name} – białko, kalorie, makro`.replace(/"/g, '&quot;');
                return `<a href="${url}" class="shop-item" title="${title}"><span>${p.emoji}</span>${p.name}</a>`;
            }).join('');
        }

        function calculateEverything() {
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const age = parseInt(document.getElementById('age').value);
            const weight = parseFloat(document.getElementById('weight').value);
            const heightCm = parseFloat(document.getElementById('height').value);
            const activity = parseFloat(document.getElementById('activity').value);
            const goal = document.getElementById('goal').value;

            if (!age || !weight || !heightCm) { alert("Wypełnij formularz!"); return; }

            const bmi = (weight / ((heightCm/100) * (heightCm/100))).toFixed(1);

            const finish = () => {
            document.getElementById('bmiValue').innerText = bmi;

            let pointerPos = 50; let sText = "Waga prawidłowa"; let sClass = "status-normal";
            if(bmi < 18.5) { sText="Niedowaga"; sClass="status-underweight"; pointerPos=15; }
            else if(bmi < 25) { pointerPos = 40; }
            else if(bmi < 30) { sText="Nadwaga"; sClass="status-overweight"; pointerPos=65; }
            else { sText="Otyłość"; sClass="status-obese"; pointerPos=85; }
            
            const bStatus = document.getElementById('bmiStatus');
            bStatus.innerText = sText; bStatus.className = "bmi-status " + sClass;
            document.getElementById('bmiPointer').style.left = pointerPos + "%";

            const dBox = document.getElementById('bmiDangerBox');
            if(bmi < 18.5 || bmi >= 25) {
                dBox.style.display = "block";
                document.getElementById('bmiDangerText').innerText = bmi < 18.5 ? "Ryzyko osteoporozy i osłabienia odporności." : "Ryzyko obciążenia serca, stawów i insulinooporności.";
            } else { dBox.style.display = "none"; }

            let bmr = (gender === 'male') ? (10*weight + 6.25*heightCm - 5*age + 5) : (10*weight + 6.25*heightCm - 5*age - 161);
            let tdee = bmr * activity;
            if(goal === 'lose') tdee -= 400; if(goal === 'gain') tdee += 300;
            const finalKcal = Math.round(tdee);
            
            document.getElementById('calcKcal').innerText = finalKcal + " kcal";
            let pGrams = Math.round(weight * (goal==='lose'? 2.0 : (goal==='gain'? 1.8 : 1.6)));
            let fGrams = Math.round((finalKcal * 0.25)/9);
            let cGrams = Math.round((finalKcal - (pGrams*4 + fGrams*9))/4);

            document.getElementById('calcProtein').innerText = pGrams + "g";
            document.getElementById('calcFat').innerText = fGrams + "g";
            document.getElementById('calcCarbs').innerText = cGrams + "g";
            document.getElementById('calcWater').innerText = (weight * 0.035).toFixed(1) + " Litra";

            renderShopSuggestions(goal);

            const isMale = gender === 'male';
            const tbody = document.getElementById('microTableBody');
            const micros = [
                ['Witamina A', isMale ? '900 mcg' : '700 mcg', 'Marchew, wątróbka, jajka, szpinak'],
                ['Witamina B1 (tiamina)', isMale ? '1,2 mg' : '1,1 mg', 'Pełnoziarniste zboża, wieprzowina, fasola'],
                ['Witamina B2 (ryboflawina)', isMale ? '1,3 mg' : '1,1 mg', 'Mleko, jajka, mięso, migdały'],
                ['Witamina B3 (niacyna)', isMale ? '16 mg' : '14 mg', 'Drób, tuńczyk, orzechy, pieczywo'],
                ['Witamina B5 (kwas pantotenowy)', '5 mg', 'Podroby, jaja, pieczarki, awokado'],
                ['Witamina B6 (pirydoksyna)', isMale ? '1,7 mg' : '1,5 mg', 'Łosoś, banan, ziemniaki, kurczak'],
                ['Witamina B7 (biotyna)', '30 mcg', 'Jaja, orzechy, łosoś, słodkie ziemniaki'],
                ['Witamina B9 (kwas foliowy)', '400 mcg', 'Szpinak, brokuły, soczewica, pomarańcze'],
                ['Witamina B12 (kobalamina)', '2,4 mcg', 'Mięso, ryby, nabiał, wątroba'],
                ['Witamina C', isMale ? '90 mg' : '75 mg', 'Papryka, cytrusy, brokuły, kiwi'],
                ['Witamina D', '15 mcg (600 IU)', 'Łosoś, wędzone ryby, jaja, słońce'],
                ['Witamina E', '15 mg', 'Olej rzepakowy, orzechy, nasiona słonecznika'],
                ['Witamina K', isMale ? '120 mcg' : '90 mcg', 'Szpinak, brokuły, jarmuż, kapusta'],
                ['Cholina', isMale ? '550 mg' : '425 mg', 'Jaja, wątrówka, kurczak, soja'],
                ['Wapń', isMale ? '1000 mg' : '1000 mg', 'Mleko, jogurt, ser, jarmuż, sardynki'],
                ['Chrom', isMale ? '35 mcg' : '25 mcg', 'Brokuły, pełne ziarna, mięso'],
                ['Miedź', '900 mcg', 'Wątroba, orzechy, nasiona, kakao'],
                ['Fluor', isMale ? '4 mg' : '3 mg', 'Herbata, ryby, woda fluorowana'],
                ['Jod', '150 mcg', 'Ryby morskie, iodowana sól, nori'],
                ['Żelazo', isMale ? '8 mg' : '18 mg', 'Czerwone mięso, soczewica, szpinak, pestki dyni'],
                ['Magnez', isMale ? '420 mg' : '320 mg', 'Orzechy, kasza gryczana, banan, kakao'],
                ['Mangan', isMale ? '2,3 mg' : '1,8 mg', 'Pełne ziarna, orzechy, herbata, ryż brązowy'],
                ['Molibden', '45 mcg', 'Fasola, soczewica, pełne ziarna, orzechy'],
                ['Fosfor', '700 mg', 'Mięso, ryby, nabiał, orzechy'],
                ['Potas', isMale ? '3400 mg' : '2600 mg', 'Ziemniaki, banan, awokado, szpinak'],
                ['Selen', '55 mcg', 'Brazylijskie orzechy, ryby, jaja, czosnek'],
                ['Sód', 'max. 2300 mg', 'Ogranicz sól, wędliny, przetworzoną żywność'],
                ['Cynk', isMale ? '11 mg' : '8 mg', 'Wołowina, ostrygi, pestki dyni, jaja']
            ];
            tbody.innerHTML = micros.map(([name, dose, sources]) =>
                `<tr><td><strong>${name}</strong></td><td>${dose}</td><td>${sources}</td></tr>`
            ).join('');

            const microBadge = document.getElementById('microCollapseBadge');
            const microSub = document.getElementById('microCollapseSub');
            if (microBadge) microBadge.textContent = String(micros.length);
            if (microSub) {
                microSub.textContent = `Orientacyjne RDA/AI dla ${isMale ? 'mężczyzny' : 'kobiety'} — rozwiń pełną tabelę`;
            }
            const microCollapse = document.getElementById('microCollapse');
            if (microCollapse) microCollapse.open = false;

            document.getElementById('reductionTips').style.display = (goal==='lose'?'block':'none');
            document.getElementById('resultBox').style.display = "block";
            document.getElementById('resultBox').scrollIntoView({ behavior: 'smooth' });
            };

            if (typeof ensureProductsDatabase === 'function') {
                ensureProductsDatabase().then(finish).catch(finish);
            } else {
                finish();
            }
        }
