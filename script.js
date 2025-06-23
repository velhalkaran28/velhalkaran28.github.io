async function fetchCountries() {
    const countries = await fetch("https://api.worldbank.org/v2/country?format=json&per_page=300")
      .then(res => res.json())
      .then(data => data[1]);
    const select = document.getElementById("country");
    countries.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.name;
      select.appendChild(option);
    });
  }
  
  async function fetchIndicators() {
    const indicators = [
      { id: "NY.GDP.PCAP.CD", name: "GDP per capita (current US$)" },
      { id: "SP.DYN.LE00.IN", name: "Life expectancy at birth" },
      { id: "SE.XPD.TOTL.GD.ZS", name: "Education expenditure (% of GDP)" }
    ];
    const select = document.getElementById("indicator");
    indicators.forEach(ind => {
      const option = document.createElement("option");
      option.value = ind.id;
      option.textContent = ind.name;
      select.appendChild(option);
    });
  }
  
  async function loadData() {
    const country = document.getElementById("country").value;
    const indicator = document.getElementById("indicator").value;
    const start = document.getElementById("startYear").value;
    const end = document.getElementById("endYear").value;
  
    const indicatorURL = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&date=${start}:${end}&per_page=500`;
    const happinessURL = `https://raw.githubusercontent.com/unsdsn/world-happiness/master/2015-2024.csv`; // Replace with a valid CSV if needed
  
    const indData = await fetch(indicatorURL).then(r => r.json()).then(d => d[1]);
    const hapData = await fetch(happinessURL).then(r => r.text()).then(parseCSV);
  
    const years = [], indValues = [], hapValues = [];
  
    for (let y = start; y <= end; y++) {
      const ind = indData.find(d => d.date == y);
      const hap = hapData.find(row => row["Country name"] === country && row["year"] == y);
  
      years.push(y);
      indValues.push(ind?.value ?? null);
      hapValues.push(hap ? parseFloat(hap["Ladder score"]) : null);
    }
  
    drawChart(years, indValues, hapValues);
  }
  
  function parseCSV(text) {
    const rows = text.split("\n");
    const headers = rows[0].split(",");
    return rows.slice(1).map(row => {
      const values = row.split(",");
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]);
      return obj;
    });
  }
  
  function drawChart(labels, indicatorData, happinessData) {
    const ctx = document.getElementById("chart").getContext("2d");
    if (window.myChart) window.myChart.destroy();
    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: "Development Indicator",
            data: indicatorData,
            borderColor: "blue",
            fill: false
          },
          {
            label: "Happiness Index",
            data: happinessData,
            borderColor: "green",
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
  
  // Initial setup
  fetchCountries();
  fetchIndicators();
  