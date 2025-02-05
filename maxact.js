        // Laddar Google Charts
        google.charts.load('current', {
          'packages':['corechart']
      });

      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
          var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1Uj6zHJDj8G3qEFwAR830AX63SpzJWaeGIDtUMo14XWA/gviz/tq?sheet=Pearson%20korrelation');
          query.send(handleQueryResponse);
      }

      function handleQueryResponse(response) {
          if (response.isError()) {
              console.log('Error: ' + response.getMessage() + ' ' + response.getDetailedMessage());
              return;
          }

          var data = response.getDataTable();
          var options = {
              title: 'Exempelgraf',
              height: 300
          };

          var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
          chart.draw(data, options);
      }

      // Repost funktionalitet
      
      let recentHabits = JSON.parse(localStorage.getItem('recentHabits')) || []; // Ladda från localStorage
      let isDropdownVisible = false; // För att spåra visibilitet av rullgardinsmenyn

      function saveHabitsToLocalStorage() {
          localStorage.setItem('recentHabits', JSON.stringify(recentHabits));
      }


      function renderRecentHabits() {
          const container = document.getElementById("repostContainer");
          container.innerHTML = "";

          recentHabits.reverse().forEach((habit, index) => {
              const repostDiv = document.createElement("div");
              repostDiv.className = "repost";

              // Skapa innehållsdelen
              const contentDiv = document.createElement("div");
              contentDiv.className = "repost-content";

              // Titel (Kategori och huvudinfo)
              const titleDiv = document.createElement("div");
              titleDiv.className = "repost-title";
              titleDiv.textContent = `${habit.Kategori}`;

              // Detaljer (varierar beroende på kategori)
              const detailsDiv = document.createElement("div");
              detailsDiv.className = "repost-details";

              // Anpassa detaljerna baserat på kategori
              let details = '';
              switch (habit.Kategori) {
                  case "Dryck":
                      details = `${habit["Vilken Dryck"]} - ${habit["Antal Drycker"]}st, ${habit["Milliliter/st"]}ml`;
                      break;
                  case "Kost":
                      details = `${habit["Typ av måltid"]} - ${habit["Måltid"]}, ${habit["Antal Portioner"]} portioner, ${habit.Kalorier} kcal`;
                      break;
                  case "Träning":
                      details = `${habit["Kropps Område"]} - ${habit["Varaktighet totalt"]}min, ${habit.Reps} reps, ${habit.Sets} sets`;
                      break;
                  case "Fotbollsträning":
                      details = `${habit["Fotbollsträning"]} - ${habit["Vad tränade du"]}min, ${habit["Hur länge varade träningen"]}min `;
                      break;
                  case "Sömn":
                      details = `${habit["Sömn"]} - ${habit["Antal timmar du sov"]}min`;
                      break;
                  case "Fysisk aktivitet":
                      details = `${habit["Fysisk Aktivitet"]} - ${habit["Antal Kilometer"]}km`;
                      break;
                  case "Kosttillskott":
                      details = `${habit["Kosttillskott"]} - ${habit["Kosttillskott"]}g`;
                      break;
                  case "Övrigt":
                      details = `${habit["Övrig vana"]} - ${habit["Vanans varaktighet"]}min`;
                      break;
              }
              detailsDiv.textContent = details;

              // Lägg till innehåll
              contentDiv.appendChild(titleDiv);
              contentDiv.appendChild(detailsDiv);
              repostDiv.appendChild(contentDiv);

              // Knappar
              const buttonsDiv = document.createElement("div");
              buttonsDiv.className = "repost-button";

              const addButton = document.createElement("button");
              addButton.textContent = "+";
              addButton.title = "Återanvänd denna vana";
              addButton.addEventListener("click", () => {
                  fillFormWithHabit(habit);
              });

              const closeButton = document.createElement("button");
              closeButton.textContent = "×";
              closeButton.title = "Ta bort från listan";
              closeButton.addEventListener("click", () => {
                  recentHabits.splice(index, 1);
                  saveHabitsToLocalStorage();
                  renderRecentHabits();
              });

              buttonsDiv.appendChild(addButton);
              buttonsDiv.appendChild(closeButton);
              repostDiv.appendChild(buttonsDiv);

              container.appendChild(repostDiv);
          });
      }

      function fillFormWithHabit(habit) {
          document.getElementById("Kategori").value = habit.Kategori;
          document.getElementById("Datum").value = habit.Datum;
          document.getElementById("Tid").value = habit.Tid;
          document.getElementById("Beskrivning").value = habit.Beskrivning;

          // Trigga kategori-ändring för att ladda dynamiska fält
          const event = new Event('change');
          document.getElementById("Kategori").dispatchEvent(event);

          // Vänta lite så att dynamiska fält hinner laddas
          setTimeout(() => {
              Object.keys(habit).forEach(key => {
                  const element = document.getElementById(key);
                  if (element) {
                      element.value = habit[key];
                  }
              });
          }, 100);
      }

      // Lägg till en ny vana (exempel på användning)
      function addNewHabit(habit) {
          recentHabits.push(habit);
          saveHabitsToLocalStorage();
          renderRecentHabits();
      }

      // Visa/Dölj rullgardinsmeny
function toggleDropdown() {
    const container = document.getElementById("repostContainer");
    isDropdownVisible = !isDropdownVisible;
    container.style.display = isDropdownVisible ? "block" : "none";
}


document.addEventListener("DOMContentLoaded", () => {
    renderRecentHabits();

    document.addEventListener("DOMContentLoaded", () => {
      const menuItems = document.querySelectorAll('#myMenu li a');
      menuItems.forEach(item => {
          item.addEventListener('click', (e) => {
              e.preventDefault();
              
              // Ta bort active class från alla items
              menuItems.forEach(i => i.classList.remove('active'));
              // Lägg till active class på klickad item
              e.target.classList.add('active');
              
              const category = e.target.textContent;
              filterRepostsByCategory(category);
          });
      });
  });
    
    // Dölj repost-rutorna initialt
    document.getElementById("repostContainer").style.display = "none";

    // Skapa och placera knappen för att visa/dölja vanor
    const toggleButton = document.createElement("button");
    toggleButton.id = "toggleRepostButton";
    toggleButton.textContent = "Show all habits";
    toggleButton.addEventListener("click", toggleDropdown);

    const chartDiv = document.getElementById("chart_div");
    chartDiv.insertAdjacentElement("afterend", toggleButton);


    // Dölj statistik initialt
    showFrequentHabits();
});

      // Hålla reda på användningsfrekvens
      let habitUsageCount = JSON.parse(localStorage.getItem('habitUsageCount')) || {};

      function incrementHabitUsage(habitCategory) {
          habitUsageCount[habitCategory] = (habitUsageCount[habitCategory] || 0) + 1;
          localStorage.setItem('habitUsageCount', JSON.stringify(habitUsageCount));
      }

      function renderHabitStatistics() {
          const statsContainer = document.getElementById("habitStatsContainer");
          statsContainer.innerHTML = "";

          if (Object.keys(habitUsageCount).length === 0) {
              statsContainer.textContent = "Inga vanor har använts ännu.";
          } else {
              const sortedHabits = Object.entries(habitUsageCount).sort((a, b) => b[1] - a[1]);
              sortedHabits.forEach(([category, count]) => {
                  const statDiv = document.createElement("div");
                  statDiv.className = "habit-stat";
                  statDiv.textContent = `${category}: ${count} gånger`;
                  statsContainer.appendChild(statDiv);
              });
          }
      }

      // Visa/Dölj funktion för statistik
      // Lägg till istället:
function showFrequentHabits() {
  const statsContainer = document.getElementById("habitStatsContainer");
  const frequentContainer = document.getElementById("frequentHabitsContainer");
  
  // Visa containrarna
  statsContainer.style.display = "block";
  frequentContainer.style.display = "block";
  
  // Rendera innehållet
  renderHabitStatistics();
  renderFrequentHabits();
}

     // Ny funktion för att rendera de mest frekventa vanorna
function renderFrequentHabits() {
  const frequentContainer = document.getElementById("frequentHabitsContainer");
  frequentContainer.innerHTML = ""; // Rensa tidigare innehåll

  const sortedHabits = Object.entries(habitUsageCount)
      .sort((a, b) => b[1] - a[1]) // Sortera i fallande ordning
      .slice(0, 4); // Ta de 4 mest frekventa

  sortedHabits.forEach(([category, count]) => {
      const repostDiv = document.createElement("div");
      repostDiv.className = "repost";

      // Skapa innehållsdelen
      const contentDiv = document.createElement("div");
      contentDiv.className = "repost-content";

      const titleDiv = document.createElement("div");
      titleDiv.className = "repost-title";
      titleDiv.textContent = `${category}`;

      const detailsDiv = document.createElement("div");
      detailsDiv.className = "repost-details";

      // Här anpassar vi detaljerna baserat på kategori
      let details = '';
      switch (category) {
          case "Dryck":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Kost":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Träning":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Fotbollsträning":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Sömn":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Fysisk aktivitet":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Kosttillskott":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          case "Övrigt":
              details = `(${getMostFrequentHabitDetails(category)})`;
              break;
          default:
              details = "Ingen detaljinformation tillgänglig.";
              break;
      }
      detailsDiv.textContent = `Använd ${count} gånger: ${details}`;

      contentDiv.appendChild(titleDiv);
      contentDiv.appendChild(detailsDiv);
      repostDiv.appendChild(contentDiv);

      // Knappar
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "repost-buttons";

      const addButton = document.createElement("button");
      addButton.textContent = "+";
      addButton.title = "Återanvänd denna vana";
      addButton.addEventListener("click", () => {
          fillFormWithHabit({ Kategori: category }); // Anpassa här för att fylla med vanan
      });

      const closeButton = document.createElement("button");
      closeButton.textContent = "×";
      closeButton.title = "Ta bort från listan";
      closeButton.addEventListener("click", () => {
          delete habitUsageCount[category]; // Ta bort från räknaren
          localStorage.setItem('habitUsageCount', JSON.stringify(habitUsageCount));
          renderFrequentHabits(); // Återrendera
      });

      buttonsDiv.appendChild(addButton);
      buttonsDiv.appendChild(closeButton);
      repostDiv.appendChild(buttonsDiv);

      frequentContainer.appendChild(repostDiv);
  });
}

// Funktion för att hämta detaljinformation om den mest frekventa vanan
function getMostFrequentHabitDetails(category) {
  const recentHabits = JSON.parse(localStorage.getItem('recentHabits')) || [];
  const filteredHabits = recentHabits.filter(habit => habit.Kategori === category);
  
  // Hitta den mest frekventa vanan inom denna kategori
  if (filteredHabits.length === 0) return "Ingen detaljinformation tillgänglig.";

  // Här kan vi anta att vi använder det senaste ifall det finns flera
  const mostFrequentHabit = filteredHabits[filteredHabits.length - 1]; 

  let details = '';
  switch (category) {
      case "Dryck":
          details = `${mostFrequentHabit["Vilken Dryck"]} - ${mostFrequentHabit["Antal Drycker"]}st, ${mostFrequentHabit["Milliliter/st"]}ml`;
          break;
      case "Kost":
          details = `${mostFrequentHabit["Typ av måltid"]} - ${mostFrequentHabit["Måltid"]}, ${mostFrequentHabit["Antal Portioner"]} portioner, ${mostFrequentHabit.Kalorier} kcal`;
          break;
      case "Träning":
          details = `${mostFrequentHabit["Kropps Område"]} - ${mostFrequentHabit["Varaktighet totalt"]}min, ${mostFrequentHabit["Brända Kalorier"]} kcal, ${mostFrequentHabit.Reps} reps, ${mostFrequentHabit.Sets} sets`;
          break;
      case "Fotbollsträning":
          details = `${mostFrequentHabit["Vad tränade du"]} - ${mostFrequentHabit["Hur länge varade träningen"]}min`;
          break;
      case "Sömn":
          details = `${mostFrequentHabit["Sömn"]} - ${mostFrequentHabit["Antal timmar du sov"]} tim`;
          break;
      case "Fysisk aktivitet":
          details = `${mostFrequentHabit["Fysisk Aktivitet"]} - ${mostFrequentHabit["Antal Kilometer"]}km`;
          break;
      case "Kosttillskott":
          details = `${mostFrequentHabit["Kosttillskott"]} - ${mostFrequentHabit["Gram kosttillskott"]}g`;
          break;
      case "Övrigt":
          details = `${mostFrequentHabit["Övrig vana"]} - ${mostFrequentHabit["Vanans varaktighet"]}min`;
          break;
      default:
          details = "Ingen detaljinformation tillgänglig.";
          break;
  }
  return details;
}
      // CSS-förbättringar för bättre visning av statistik
      const style = document.createElement("style");
      style.innerHTML = `
          .habit-stat {
              background-color: #8897D2;
              color: white;
              padding: 10px;
              margin: 5px 0;
              border-radius: 5px;
              text-align: center;
          }
      `;
      document.head.appendChild(style);

      const form = document.getElementById("Enkät");

      form.addEventListener("submit", async function(event) {
          event.preventDefault();
      
          // Hämta submit-knappen
          const submitButton = form.querySelector('input[type="submit"]');
          const originalButtonText = submitButton.value;
      
          try {
              // Inaktivera knappen och visa laddningsanimation
              submitButton.disabled = true;
              submitButton.value = 'Sending...';
              
              // Lägg till spinner
              const spinner = document.createElement('div');
              spinner.className = 'loading-spinner';
              submitButton.parentNode.appendChild(spinner);
      
              const formData = new FormData(form);
              const habitData = Object.fromEntries(formData.entries());
              
              // Lägg till i recentHabits och uppdatera visningen
              recentHabits.push(habitData);
              localStorage.setItem('recentHabits', JSON.stringify(recentHabits));
              renderRecentHabits();
      
              // Öka användningsfrekvens
              incrementHabitUsage(habitData.Kategori);
      
              // Skicka data till Google Apps Script
              const response = await fetch("https://script.google.com/macros/s/AKfycbxvWY9t1hfT5txeHh8nuUaVI9RG8uAQArdOEl8fWwIc827kgIijn1VFtCA8EkpT0OR1/exec", {
                  method: "POST",
                  body: formData
              });
      
              const data = await response.json();
      
              if (data.result === "success") {
                  // Visa success meddelande
                  submitButton.value = 'Success!';
                  submitButton.style.backgroundColor = '#4CAF50';
                  
                  showFrequentHabits();
                  
                  // Återställ formuläret
                  setTimeout(() => {
                      form.reset();
                      const now = new Date();
                      const currentDate = now.toISOString().split("T")[0];
                      const currentTime = now.toTimeString().slice(0, 5);
                      document.getElementById("Datum").value = currentDate;
                      document.getElementById("Tid").value = currentTime;
                      
                      // Återställ knappen
                      submitButton.disabled = false;
                      submitButton.value = originalButtonText;
                      submitButton.style.backgroundColor = '';
                      spinner.remove();
                  }, 2000);
              } else {
                  throw new Error("Submission failed");
              }
          } catch (error) {
              console.error("Fel vid inlämning:", error);
              
              // Visa error meddelande
              submitButton.value = 'Error!';
              submitButton.style.backgroundColor = '#ff4444';
              
              // Återställ knappen efter 2 sekunder
              setTimeout(() => {
                  submitButton.disabled = false;
                  submitButton.value = originalButtonText;
                  submitButton.style.backgroundColor = '';
                  if (submitButton.parentNode.querySelector('.loading-spinner')) {
                      submitButton.parentNode.querySelector('.loading-spinner').remove();
                  }
              }, 2000);
          }
      });

      // Initialisering av datum och tid
      document.addEventListener("DOMContentLoaded", function() {
          const now = new Date();
          const currentDate = now.toISOString().split("T")[0];
          const currentTime = now.toTimeString().slice(0, 5);
          
          document.getElementById("Datum").value = currentDate;
          document.getElementById("Tid").value = currentTime;

          // Sätt upp kategori-lyssnare
          const kategoriField = document.getElementById("Kategori");
          const dynamicFieldsContainer = document.getElementById("dynamic-fields");

          kategoriField.addEventListener("change", function() {
              const selectedCategory = kategoriField.value;
              dynamicFieldsContainer.innerHTML = "";


              if (selectedCategory === "Dryck") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vilken Dryck">Vilken Dryck:</label>
                      <select id="Vilken Dryck" name="Vilken Dryck" required>
                          <option value="Vatten">Vatten</option>
                          <option value="Mjölk">Mjölk</option>
                          <option value="Saft">Saft</option>
                          <option value="Läsk">Läsk</option>
                          <option value="Energi dryck">Energi dryck</option>
                          <option value="Kaffe">Kaffe</option>
                          <option value="Te">Te</option>
                          <option value="Smoothie">Smoothie</option>
                          <option value="Övrigt">Övrigt</option>
                          <option value="Alkohol">Alkohol</option>
                      </select>

                      <label for="Antal Drycker">Antal Drycker:</label>
                      <select id="Antal Drycker" name="Antal Drycker" required>
                          ${[...Array(10)].map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                      </select>
                      
                      <label for="Milliliter/st">Milliliter/st:</label>
                      <select id="Milliliter/st" name="Milliliter/st" required>
                          ${Array.from({length: 300}, (_, i) => (i + 1) * 10).map(val => `<option value="${val}">${val}</option>`).join('')}
                      </select>
                  `;
              } else if (selectedCategory === "Kost") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Typ av måltid">Typ av måltid:</label>
                      <select id="Typ av måltid" name="Typ av måltid" required>
                          <option value="Frukost">Frukost</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Middag">Middag</option>
                          <option value="Snack">Snack</option>

                      </select>

                      <label for="Måltid">Måltid:</label>
                      <input type="text" id="Måltid" name="Måltid" placeholder="Vad åt du för något?" required>

                      <label for="Antal Portioner">Antal portioner:</label>
                      <select id="Antal Portioner" name="Antal Portioner" required>
                          ${[...Array(10)].map((_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
                      </select>

                      <label for="Kalorier">Kalorier:</label>
                      <input type="text" id="Kalorier" name="Kalorier" placeholder="Skriv in kalorier" required>

                  `;
              } else if (selectedCategory === "Sömn") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vilken typ av sömn">Vilken typ av sömn:</label>
                      <select id="Vilken typ av sömn" name="Vilken typ av sömn" required>
                          <option value="Power nap">Power nap</option>
                          <option value="Vanlig Sömn">Vanlig Sömn</option>
                      </select>
                      <input type="text" id="Sömn timmar" name="Sömn timmar" placeholder="Hur många timmar sov du?" required>
                   `;
              } else if (selectedCategory === "Fotbollsträning") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Vad tränade du">Vad tränade du:</label>
                      <input type="text" id="Vad tränade du" name="Vad tränade du" placeholder="Vad var det för träning du gjorde?" required>
                      
                      <label for="Hur länge varade träningen">Hur länge varade träningen:</label>
                      <input type="text" id="Hur länge varade träningen" name="Hur länge varade träningen" placeholder="Hur länge varade träningen?" required>
                   `;
              } else if (selectedCategory === "Träning") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Kropps Område">Kropps Område:</label>
                      <select id="Kropps Område" name="Kropps Område" required>
                          <option value="">Välj kroppsområde</option>
                          <option value="Armar">Armar</option>
                          <option value="Ben">Ben</option>
                          <option value="Rygg">Rygg</option>
                          <option value="Axlar">Axlar</option>
                          <option value="Mage">Mage</option>
                          <option value="Bröst">Bröst</option>
                          <option value="Plyometrics">Plyometrics</option>
                          <option value="Helkroppspass">Helkroppspass</option>
                          <option value="Funktionspass">Funktionspass</option>
                          <option value="Övrigt">Övrigt</option>
                      </select>

                      <label for="Varaktighet totalt">Varaktighet totalt:</label>
                      <input type="text" id="Varaktighet totalt" name="Varaktighet totalt" placeholder="Hur många minuter tränade du området totalt" required>
                      <label for="Brända Kalorier">Brända Kalorier:</label>
                      <input type="text" id="Brända Kalorier" name="Brända Kalorier" placeholder="Hur många kalorier brände du under träningen?" required>

                      <label for="Antal reps">Antal Reps:</label>
                      <input type="text" id="Reps" name="Reps" placeholder="Hur många reps?" required>

                      <label for="Antal sets">Antal sets:</label>
                      <input type="text" id="Sets" name="Sets" placeholder="Hur många sets?" required>
                  `;
              } else if (selectedCategory === "Fysisk aktivitet") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Fysisk Aktivitet">Fysisk Aktivitet:</label>
                      <select id="Fysisk Aktivitet" name="Fysisk Aktivitet" required>
                          <option value="">Välj fysisk aktivitet</option>
                          <option value="Springa">Springa</option>
                          <option value="Jogga">Jogga</option>
                          <option value="Gång">Gång</option>
                      </select>

                      <label for="Antal Kilometer">Antal Kilometer:</label>
                      <input type="text" id="Antal Kilometer" name="Antal Kilometer" placeholder="Antal km" required>
                  `;
                } else if (selectedCategory === "Kosttillskott") {
                    dynamicFieldsContainer.innerHTML = `
                        <label for="Vilket kosttillskott">Vilket kosttillskott:</label>
                        <input type="text" id="VilketKosttillskott" name="Vilket kosttillskott" placeholder="Vilken typ av kosttillskott" required>
                    </selcet>
                        <label for="Antal gram Kosttillskott">Antal gram Kosttillskott:</label>
                        <input type="text" id="Kosttillskott" name="Gram kosttillskott" placeholder="Antal gram kosttillskott" required>
                    `;
            
              } else if (selectedCategory === "Övrigt") {
                  dynamicFieldsContainer.innerHTML = `
                      <label for="Övrig Vana">Övrig vana:</label>
                      <input type="text" id="Övrig vana" name="Övrig vana" placeholder="Vilken övrig vana har du gjort" required>
                      
                      <label for="Vanans varaktighet">Vanans varaktighet:</label>
                      <input type="text" id="Vanans varaktighet" name="Vanans varaktighet" placeholder="Hur många minuter tog det totalt" required>
                  `;
              }
            
                    
          });
      });

      // Lägg till denna kod efter dina andra event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Lägg till klick-hanterare för menyn
    const menuItems = document.querySelectorAll('#myMenu li a');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.textContent;
            filterRepostsByCategory(category);
        });
    });
});

// Lägg till denna funktion i din kod
function filterRepostsByCategory(category) {
    const container = document.getElementById("repostContainer");
    const reposts = container.getElementsByClassName("repost");
    
    // Visa container och se till att den är synlig
    container.style.display = "block";
    isDropdownVisible = true;
    
    Array.from(reposts).forEach(repost => {
        const repostCategory = repost.querySelector(".repost-title").textContent.trim();
        console.log('Comparing:', repostCategory, 'with:', category); // För debugging
        
        if (category === "All" || repostCategory === category) {
            repost.style.display = "block";
        } else {
            repost.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderRecentHabits();
    
    // Lägg till klick-hanterare för menyn
    const menuItems = document.querySelectorAll('#myMenu li a');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = mapCategoryName(e.target.textContent); // Lägg till denna rad
            filterRepostsByCategory(category);
        });
    });

    // Initialisera datum och tid
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    document.getElementById("Datum").value = currentDate;
    document.getElementById("Tid").value = currentTime;

    // Sätt upp övriga event listeners och initialisering
    setupFormHandlers();
});function mapCategoryName(menuText) {
    const categoryMap = {
        'Diet': 'Kost',
        'Dietary supplements': 'Kosttillskott',
        'Beverage': 'Dryck',
        'Training': 'Träning',
        'Physical activity': 'Fysisk aktivitet',
        'Soccer practice': 'Fotbollsträning',
        'Sleep': 'Sömn',
        'Other': 'Övrigt',
        'All': 'All'
    };
    return categoryMap[menuText] || menuText;
}

  document.getElementById("toggleBtn").addEventListener("click", function () {
    const section = document.getElementById("ShowHide");
    section.classList.toggle("show");
  });

  function Formulär() {
    const formSection = document.getElementById("ShowFormulär");
    formSection.classList.toggle("show");
  }
