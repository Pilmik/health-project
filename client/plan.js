document.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Користувач не авторизований");
      return;
    }

    const response = await fetch("http://localhost:5000/api/plan", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Не вдалося отримати план");
    }

    const plan = await response.json();

    document.getElementById("totalCalories").textContent = plan.calories;
    document.getElementById("proteinGrams").textContent = plan.proteinGrams;
    document.getElementById("fatsGrams").textContent = plan.fatGrams;
    document.getElementById("carbsGrams").textContent = plan.carbGrams;
    document.getElementById("waterLiters").textContent = plan.waterLiters;
    document.getElementById("stepsTarget").textContent = plan.stepsPerDay;
    document.getElementById("carbsPercent").textContent = "50%";
    document.getElementById("proteinPercent").textContent = "25%";
    document.getElementById("fatsPercent").textContent = "25%";
    document.querySelector(".goal-details").innerHTML = `
      <p>Ваша мета: <span>${plan.targetWeight} кг</span></p>
      <p>Очікувана дата досягнення: <span>${new Date(plan.targetDate).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</span></p>`;

    const data = {
      labels: ["Вуглеводи", "Білки", "Жири"],
      datasets: [
        {
          data: [plan.carbGrams, plan.proteinGrams, plan.fatGrams],
          backgroundColor: ["#03A9F4", "#7E57C2", "#FFA726"],
          borderWidth: 0,
          cutout: "75%",
        },
      ],
    };

    const labelPlugin = {
      id: "labelPlugin",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const values = chart.data.datasets[0].data;

        ctx.save();
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        meta.data.forEach((arc, index) => {
          const angle = (arc.startAngle + arc.endAngle) / 2;
          const radius = (arc.outerRadius + arc.innerRadius) / 2 + 30;
          const x = arc.x + Math.cos(angle) * radius;
          const y = arc.y + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.arc(x, y, 24, 0, 2 * Math.PI);
          ctx.fillStyle = "#eeeeee";
          ctx.fill();

          ctx.fillStyle = "#000";
          ctx.fillText(`${values[index]} г`, x, y);
        });

        ctx.restore();
      },
    };

    const options = {
      responsive: false,
      layout: {
        padding: 40,
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    };

    const ctx = document
      .getElementById("macroDonutChart")
      .getContext("2d");
    new Chart(ctx, {
      type: "doughnut",
      data,
      options,
      plugins: [labelPlugin],
    });
  } catch (err) {
    alert("Не вдалося завантажити персональний план");
  }
});
