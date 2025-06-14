const text = "Why Spotter AI";
const typedText = document.getElementById("tag-text");
let i = 0;

function type() {
  if (i < text.length) {
    typedText.textContent += text.charAt(i);
    i++;
    setTimeout(type, 100);
  }
}

window.addEventListener("load", type);

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("menuToggle");
  const nav = document.querySelector("nav");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle('active');
    nav.classList.toggle("active");
  });
});

const getOrCreateTooltip = (chart) => {
  let tooltipEl = document.getElementById("hover-tooltip");
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.id = "chart-tooltip";
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  return tooltipEl;
};

const externalTooltipHandler = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  if (tooltip.body) {
    const title = Math.round(tooltip.title) || 0;
    const dataPoints = tooltip.dataPoints;

    const initialData1 = chart.data.datasets[0].data[0];
    const initialData2 = chart.data.datasets[1].data[0];

    const currentValue1 = dataPoints[0].raw;
    const currentValue2 = dataPoints[1].raw;

    const change1 = (
      ((currentValue1 - initialData1) / initialData1) *
      100
    ).toFixed(1);
    const change2 = (
      ((currentValue2 - initialData2) / initialData2) *
      100
    ).toFixed(1);

    const color1 = tooltip.labelColors[0].borderColor;
    const color2 = tooltip.labelColors[1].borderColor;

    tooltipEl.innerHTML = `
                    <div class="tooltip-header">${title} DAYS</div>
                    <div class="tooltip-body">
                        <div class="tooltip-item">
                            <span class="label"><span class="color-box" style="background-color: ${color1}"></span> Fingerprint</span>
                            <span class="value">${change1}%</span>
                        </div>
                        <div class="tooltip-item">
                            <span class="label"><span class="color-box" style="background-color: ${color2}"></span> Competitors</span>
                            <span class="value">${change2}%</span>
                        </div>
                    </div>
                `;
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.top = positionY + tooltip.caretY + "px";
};

const verticalHoverLinePlugin = {
  id: "verticalHoverLine",
  afterDraw: (chart) => {
    if (chart.tooltip?._active?.length) {
      let x = chart.tooltip._active[0].element.x;
      let yAxis = chart.scales.y;
      let ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yAxis.top);
      ctx.lineTo(x, yAxis.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e0e0e0";
      ctx.stroke();
      ctx.restore();
    }
  },
};

const ctx = document.getElementById("spotterChart").getContext("2d");
const granularLabels = [0, 15, 30, 45, 60, 75, 90, 105, 120];

new Chart(ctx, {
  type: "line",
  data: {
    labels: granularLabels,
    datasets: [
      {
        label: "Rate",
        data: [99.7, 98.4, 99.5, 97.2, 99.3, 97.0, 99.2, 93.1, 99.0],
        borderColor: "rgb(235, 97, 61)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6, // Show point on hover
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "rgb(235, 97, 61)",
        pointHoverBorderColor: "#fff",
        fill: false,
      },
      {
        label: "Tolls",
        data: [99.6, 99.4, 98.9, 95, 90, 88, 86, 82, 80],
        borderColor: "rgb(138, 123, 233)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "rgb(138, 123, 233)",
        pointHoverBorderColor: "#fff",
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false, // Disable default tooltip
        external: externalTooltipHandler, // Enable custom tooltip
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: "#aaa",
          font: { size: 12, family: "'Inter', sans-serif" },
          callback: function (value, index, values) {
            const visibleLabels = [0, 30, 60, 90, 120];
            if (visibleLabels.includes(granularLabels[index])) {
              return granularLabels[index];
            }
            return null;
          },
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        min: 78,
        max: 101,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
    },
  },
  plugins: [verticalHoverLinePlugin],
});
