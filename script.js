let startDate = new Date("2016-09-01");
let endDate = new Date("2017-08-31");
let selectedBoroughs = [];
let selectedZipCodes = [];
let data;

async function fetchData() {
  const response = await fetch(
    "https://raw.githubusercontent.com/rdsarjito/nyc_dataset/refs/heads/main/nyc_dataset.json"
  );
  const data = await response.json();

  return data;
}

function sum(data, key) {
  return data.reduce((acc, entry) => acc + entry[key], 0);
}

function uniqueBorough(data) {
  return Array.from(new Set(data.map((item) => item.BOROUGH)));
}

function uniqueZipCode(data) {
  return Array.from(new Set(data.map((item) => item["ZIP CODE"]))).filter(
    (zip) => zip !== 0
  );
}

function updatecreateZipCodeDropdown(data, selectedBoroughs) {
  const uniqueZipCodes = selectedBoroughs.flatMap((borough) => {
    return uniqueZipCode(data.filter((item) => item.BOROUGH === borough));
  });

  const selectElement = document.querySelector(".optionsZipCode");
  selectElement.innerHTML = "";

  const sortedUniqueZipCodes = [...new Set(uniqueZipCodes)].sort();

  sortedUniqueZipCodes.forEach((zipcode) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "option-" + zipcode;
    checkbox.value = zipcode;

    const label = document.createElement("label");
    label.htmlFor = "option-" + zipcode;
    label.textContent = zipcode;

    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);
    selectElement.appendChild(optionDiv);
  });
}

function createBoroughDropdown(data) {
  const selectTrigger = document.querySelector("#borough");
  const options = document.querySelector(".options");

  selectTrigger.addEventListener("click", function () {
    options.style.display =
      options.style.display === "block" ? "none" : "block";
  });

  const uniqueBoroughs = uniqueBorough(data);
  const selectElement = document.querySelector("div[class='options']");

  uniqueBoroughs.forEach((borough) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "option-" + borough;
    checkbox.value = borough;

    const label = document.createElement("label");
    label.htmlFor = "option-" + borough;
    label.textContent = borough;

    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);
    selectElement.appendChild(optionDiv);
  });

  selectElement.addEventListener("change", (event) => {
    selectedBoroughs = Array.from(
      selectElement.querySelectorAll("input[type='checkbox']:checked")
    ).map((checkbox) => checkbox.value);

    const filter = createFilter(
      data,
      selectedBoroughs,
      selectedZipCodes,
      startDate,
      endDate
    );

    updateChartsAndData(filter);
    updatecreateZipCodeDropdown(data, selectedBoroughs);
  });
}

function createZipCodeDropdown(data) {
  const selectTrigger = document.querySelector("#zipCode");
  const options = document.querySelector(".optionsZipCode");

  selectTrigger.addEventListener("click", function () {
    options.style.display =
      options.style.display === "block" ? "none" : "block";
  });

  const uniqueZipCodes = uniqueZipCode(data);
  const selectElement = document.querySelector(".optionsZipCode");

  uniqueZipCodes.forEach((zipCode) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "option-" + zipCode;
    checkbox.value = zipCode;

    const label = document.createElement("label");
    label.htmlFor = "option-" + zipCode;
    label.textContent = zipCode;

    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);
    selectElement.appendChild(optionDiv);
  });

  selectElement.addEventListener("change", (event) => {
    selectedZipCodes = Array.from(
      selectElement.querySelectorAll("input[type='checkbox']:checked")
    ).map((checkbox) => Number(checkbox.value));

    const filter = createFilter(
      data,
      selectedBoroughs,
      selectedZipCodes,
      startDate,
      endDate
    );

    updateChartsAndData(filter);
  });
}

function createTotalData(data) {
  const totalSales = sum(data, "SALE PRICE");
  const totalUnits = sum(data, "TOTAL UNITS");
  const totalResidentialUnits = sum(data, "RESIDENTIAL UNITS");
  const totalCommercialUnits = sum(data, "COMMERCIAL UNITS");

  document.getElementById("total_sales").textContent =
    totalSales.toLocaleString();
  document.getElementById("total_units").textContent =
    totalUnits.toLocaleString();
  document.getElementById("total_resedential_units").textContent =
    totalResidentialUnits.toLocaleString();
  document.getElementById("total_commercial_units").textContent =
    totalCommercialUnits.toLocaleString();
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function createFilter(
  data,
  selectedBoroughs = [],
  selectedZipCodes = [],
  startDate,
  endDate
) {
  const filteredData = data
    .map((item) => {
      const [date, month, year] = item["SALE DATE"]
        .split("/")
        .map((val) => Number(val));
      const convertedDate = new Date(year, month - 1, date);
      const newItem = {
        ...item,
        date: convertedDate,
        dateValue: { date, month: month - 1, year },
      };
      return newItem;
    })
    .filter((item) => item.date >= startDate && item.date <= endDate)
    .filter(
      (item) =>
        (selectedBoroughs.length === 0 ||
          selectedBoroughs.includes(item.BOROUGH)) &&
        (selectedZipCodes.length === 0 ||
          selectedZipCodes.includes(item["ZIP CODE"]))
    );

  const uniqueBoroughs = uniqueBorough(filteredData);

  function getMonthlySales() {
    const scale = d3
      .scaleUtc()
      .domain([startDate, endDate])
      .ticks(d3.utcMonth.every(1));

    const formattedScale = scale.map(
      (date) => `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    );

    const monthlySales = uniqueBoroughs.map((borough) => {
      const sales = scale.map((date) => {
        const month = date.getMonth();
        const year = date.getFullYear();
        const isOnMonthRange = (data) =>
          data.dateValue.month === month && data.dateValue.year === year;
        const data = filteredData.filter(
          (data) => data.BOROUGH === borough && isOnMonthRange(data)
        );
        const salesTotal = data.length;

        return salesTotal;
      });

      return { borough, sales };
    });

    return { data: monthlySales, scales: formattedScale };
  }

  return { getMonthlySales, data: filteredData };
}

function categorizeByYearBuilt(data) {
  const categories = {
    "1900 and Lower": 0,
    "1901-1950": 0,
    "1951-2000": 0,
    "More than 2000": 0,
  };

  data.forEach((item) => {
    const yearBuilt = item["YEAR BUILT"];
    if (yearBuilt <= 1900) {
      categories["1900 and Lower"]++;
    } else if (yearBuilt <= 1950) {
      categories["1901-1950"]++;
    } else if (yearBuilt <= 2000) {
      categories["1951-2000"]++;
    } else {
      categories["More than 2000"]++;
    }
  });

  return categories;
}

function getTop5BuildingClasses(data) {
  const buildingClassCounts = data.reduce((acc, item) => {
    const buildingClass = item["BUILDING CLASSES"];
    if (!acc[buildingClass]) {
      acc[buildingClass] = 0;
    }
    acc[buildingClass]++;
    return acc;
  }, {});

  const sortedBuildingClasses = Object.entries(buildingClassCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sortedBuildingClasses.map(([buildingClass, count]) => ({
    buildingClass,
    count,
  }));
}

function getTop5Neighborhoods(data) {
  const neighborhoodCounts = data.reduce((acc, item) => {
    const neighborhood = item["NEIGHBORHOOD"];
    if (!acc[neighborhood]) {
      acc[neighborhood] = 0;
    }
    acc[neighborhood]++;
    return acc;
  }, {});

  const sortedNeighborhoods = Object.entries(neighborhoodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sortedNeighborhoods.map(([neighborhood, count]) => ({
    neighborhood,
    count,
  }));
}

function createMontlySaleChart(filter) {
  const color = ["#36aa80", "#f2c810", "#df5a50", "#90c6f1", "#734678"];

  const totalMonthlySalesCtx = document.getElementById("totalMontlySales");

  if (totalMonthlySalesCtx.chart) {
    totalMonthlySalesCtx.chart.destroy();
  }

  const scale = filter.getMonthlySales().scales;
  const datasets = filter.getMonthlySales().data.map((item, i) => ({
    label: item.borough,
    data: item.sales,
    fill: false,
    borderColor: color[i % color.length],
    backgroundColor: color[i % color.length],
    tension: 0.3,
  }));

  totalMonthlySalesCtx.chart = new Chart(totalMonthlySalesCtx, {
    type: "line",
    data: {
      labels: scale,
      datasets: datasets,
    },
    options: {
      interaction: {
        mode: "index",
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function createYearBuiltChart(filteredData) {
  const yearBuiltCtx = document.getElementById("yearBuiltChart");

  if (yearBuiltCtx.chart) {
    yearBuiltCtx.chart.destroy();
  }

  const categories = categorizeByYearBuilt(filteredData);
  const dataValues = Object.values(categories);
  const total = dataValues.reduce((sum, value) => sum + value, 0);

  yearBuiltCtx.chart = new Chart(yearBuiltCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          label: "Year Built Distribution",
          data: dataValues,
          backgroundColor: ["#0072f0", "#3991f2", "#73b0f7", "#acd1fa"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const percentage = ((value / total) * 100).toFixed(2);
            return percentage + "%";
          },
          color: "black",
          font: {
            weight: "bold",
            size: 11,
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}

function createBuildingClassChart(filteredData) {
  const buildingClassCtx = document.getElementById("buildingClassChart");

  if (buildingClassCtx.chart) {
    buildingClassCtx.chart.destroy();
  }

  const top5BuildingClasses = getTop5BuildingClasses(filteredData);

  buildingClassCtx.chart = new Chart(buildingClassCtx, {
    type: "bar",
    data: {
      labels: top5BuildingClasses.map((item) => item.buildingClass),
      datasets: [
        {
          label: "Top 5 Building Classes",
          data: top5BuildingClasses.map((item) => item.count),
          borderWidth: 3,
          backgroundColor: "rgb(115, 176, 247)",
          borderColor: "#0072f0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function createNeighborhoodChart(filteredData) {
  const neighborhoodCtx = document.getElementById("neighborhoodChart");

  if (neighborhoodCtx.chart) {
    neighborhoodCtx.chart.destroy();
  }

  const top5Neighborhoods = getTop5Neighborhoods(filteredData);

  neighborhoodCtx.chart = new Chart(neighborhoodCtx, {
    type: "bar",
    data: {
      labels: top5Neighborhoods.map((item) => item.neighborhood),
      datasets: [
        {
          label: "Top 5 Neighborhoods",
          data: top5Neighborhoods.map((item) => item.count),
          borderWidth: 3,
          backgroundColor: "rgb(115, 176, 247)",
          borderColor: "#0072f0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function getDataReview(data) {
  data.sort((a, b) => b["RESIDENTIAL UNITS"] - a["RESIDENTIAL UNITS"]);
  const dataReview = data;
  const formatter = new Intl.NumberFormat("en-US", { currency: "USD" });

  $("#myTable").DataTable({
    data: dataReview,
    columns: [
      { data: "BOROUGH" },
      { data: "NEIGHBORHOOD" },
      { data: "ZIP CODE" },
      { data: "RESIDENTIAL UNITS" },
      { data: "COMMERCIAL UNITS" },
      { data: "TOTAL UNITS" },
      { data: "YEAR BUILT" },
      {
        data: "SALE PRICE",
        render: function (data, type, row) {
          return type === "display" && data
            ? "$" + formatter.format(data)
            : data;
        },
      },
    ],
    initComplete: function () {
      $("#myTable").wrap(
        "<div style='overflow:auto; width:100%;position:relative;'></div>"
      );
    },
  });
}

function sumByBorough(data, borough, key) {
  return data
    .filter((entry) => entry.BOROUGH === borough)
    .reduce((acc, entry) => acc + entry[key], 0);
}

function createBoroughUnitsChart(data) {
  const uniqueBoroughs = uniqueBorough(data);

  const boroughData = uniqueBoroughs.map((borough) => ({
    borough,
    residentialUnits: sumByBorough(data, borough, "RESIDENTIAL UNITS"),
    commercialUnits: sumByBorough(data, borough, "COMMERCIAL UNITS"),
  }));

  const boroughCtx = document.getElementById("boroughUnitsChart");

  if (boroughCtx.chart) {
    boroughCtx.chart.destroy();
  }

  boroughCtx.chart = new Chart(boroughCtx, {
    type: "bar",
    data: {
      labels: boroughData.map((item) => item.borough),
      datasets: [
        {
          label: "Residential Units",
          data: boroughData.map((item) => item.residentialUnits),
          borderWidth: 3,
          backgroundColor: "#0072f0",
          borderColor: "rgb(115, 176, 247)",
        },
        {
          label: "Commercial Units",
          data: boroughData.map((item) => item.commercialUnits),
          borderWidth: 3,
          backgroundColor: "rgb(115, 176, 247)",
          borderColor: "#0072f0",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function updateChartsAndData(filter) {
  createTotalData(filter.data);

  document.getElementById("totalMontlySales").innerHTML =
    '<canvas id="totalMontlySales"></canvas>';
  document.getElementById("yearBuiltChart").innerHTML =
    '<canvas id="yearBuiltChart"></canvas>';
  document.getElementById("buildingClassChart").innerHTML =
    '<canvas id="buildingClassChart"></canvas>';
  document.getElementById("neighborhoodChart").innerHTML =
    '<canvas id="neighborhoodChart"></canvas>';
  document.getElementById("boroughUnitsChart").innerHTML =
    '<canvas id="boroughUnitsChart"></canvas>';
  document.getElementById(
    "reviewTable"
  ).innerHTML = `<table id="myTable" class="display">
                                                        <thead>
                                                          <tr>
                                                            <th>BOROUGH</th>
                                                            <th>NEIGHBORHOOD</th>
                                                            <th>ZIP CODE</th>
                                                            <th>RESIDENTIAL UNITS</th>
                                                            <th>COMMERCIAL UNITS</th>
                                                            <th>TOTAL UNITS</th>
                                                            <th>YEAR BUILT</th>
                                                            <th>SALE PRICE</th>
                                                          </tr>
                                                        </thead>                    
                                                      </table>`;

  createMontlySaleChart(filter);
  createYearBuiltChart(filter.data);
  createBuildingClassChart(filter.data);
  createNeighborhoodChart(filter.data);
  createBoroughUnitsChart(filter.data);
  getDataReview(filter.data);
}

function dateFilters() {
  const filterStartDate = document.getElementById("startDate");
  const filterEndDate = document.getElementById("endDate");

  filterStartDate.setAttribute("value", startDate.toISOString().slice(0, 10));
  filterEndDate.setAttribute("value", endDate.toISOString().slice(0, 10));

  filterStartDate.addEventListener("change", (e) => {
    startDate = new Date(e.target.value);

    const filter = createFilter(
      data,
      selectedBoroughs,
      selectedZipCodes,
      startDate,
      endDate
    );
    updateChartsAndData(filter);
  });

  filterEndDate.addEventListener("change", (e) => {
    endDate = new Date(e.target.value);

    const filter = createFilter(
      data,
      selectedBoroughs,
      selectedZipCodes,
      startDate,
      endDate
    );
    updateChartsAndData(filter);
  });
}

(async function main() {
  data = await fetchData();
  startDate = new Date("2016-09-01");
  endDate = new Date("2017-08-31");

  selectedBoroughs = uniqueBorough(data);
  selectedZipCodes = uniqueZipCode(data);

  const filter = createFilter(
    data,
    selectedBoroughs,
    selectedZipCodes,
    startDate,
    endDate
  );

  createBoroughDropdown(data);
  createZipCodeDropdown(data);
  createTotalData(filter.data);
  createMontlySaleChart(filter);
  createYearBuiltChart(filter.data);
  createBuildingClassChart(filter.data);
  createNeighborhoodChart(filter.data);
  createBoroughUnitsChart(data);
  getDataReview(data);
  dateFilters();
})();
