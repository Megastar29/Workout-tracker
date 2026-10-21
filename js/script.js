//Очищення статичних карток article
const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const defaultWorkouts = [
  { id: 1, type: "Командний спорт", duration: 40, date: "2026-10-12" },
  { id: 2, type: "Кардіо", duration: 15, date: "2026-10-14" },
  { id: 3, type: "Силове", duration: 30, date: "2026-10-17" },
];

const storage_key = "workouts";

// Функція завантаження даних у localStorage
function saveToLocalStorage(items) {
  localStorage.setItem(storage_key, JSON.stringify(items));
}

// Функція для завантаження даних із localStorage
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(storage_key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Пошкоджені дані в localStorage:", error);
    return [];
  }
}

const dbName = "WorkoutsDB";
const dbVersion = 1;
const objectStoreName = "workouts";

// Функція для відкриття БД
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(objectStoreName)) {
        db.createObjectStore(objectStoreName, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Функція для додавання даних у БД
async function addItem(workout) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(objectStoreName, "readwrite");
    const objectStore = tx.objectStore(objectStoreName);

    objectStore.put(workout);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Функція для зчитування всіх даних із БД
async function getAllItems() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(objectStoreName, "readonly");
    const store = tx.objectStore(objectStoreName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Функція видалення тренування із БД
async function deleteItem(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(objectStoreName, "readwrite");
    const store = tx.objectStore(objectStoreName);

    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const migrationFlagKey = "workouts_migrated";

// Функція для здійснення міграції даних
async function migrateFromLocalStorage() {
  if (localStorage.getItem(migrationFlagKey) === "true") {
    return;
  }

  try {
    const existingInDB = await getAllItems();
    const localData = loadFromLocalStorage();

    if (existingInDB.length === 0 && localData.length > 0) {
      for (const workout of localData) {
        await addItem(workout);
      }
      console.log(
        `Міграція успішна: перенесено ${localData.length} записів у IndexedDB.`,
      );
    }

    localStorage.setItem(migrationFlagKey, "true");
  } catch (error) {
    console.error("Помилка під час міграції даних:", error);
  }
}

const listContainer = document.querySelector("#workouts-list");
const form = document.querySelector("#workout-form");
const minutesInput = document.querySelector("#duration-input");

//Функція для рендеру карток за масивом даних
function renderCards(workouts) {
  listContainer.innerHTML = "";
  for (const workout of workouts) {
    const card = document.createElement("article");
    const type = document.createElement("h3");
    const details = document.createElement("p");
    card.classList.add("card");

    type.textContent = workout.type;

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.classList.add("card-delete-btn");
    deleteBtn.textContent = "×";
    deleteBtn.title = "Видалити";
    deleteBtn.addEventListener("click", () => deleteWorkout(workout.id));

    cardHeader.append(type, deleteBtn);
    card.append(cardHeader);

    details.textContent = `${workout.duration} хв • ${workout.date}`;
    card.classList.add(classifyTraining(workout));

    card.append(details);
    listContainer.append(card);
  }
}

// Функція видалення тренування
async function deleteWorkout(id) {
  try {
    await deleteItem(id);
    await refreshUI();
  } catch (error) {
    console.error("Помилка видалення запису:", error);
    alert("Не вдалося видалити тренування зі сховища.");
  }
}

// Функція перевірки чи є дана дата у межах поточного тижня
function isWithinCurrentWeek(dateString) {
  if (!dateString) return false;

  const workoutDate = new Date(dateString);
  workoutDate.setHours(0, 0, 0, 0);

  const now = new Date();
  const currentDay = now.getDay();
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
}

function sumWeeklyDuration(arr) {
  return arr
    .filter((item) => isWithinCurrentWeek(item.date))
    .reduce((sum, item) => sum + Number(item.duration || 0), 0);
}

// Функція для оновлення числових полів статистики
function updateStatistics(workouts) {
  const countTrainings = document.querySelector("#count-trainings");
  const totalTime = document.querySelector("#total-time");
  const averageTime = document.querySelector("#average-time");
  const weeklyDurationElement = document.querySelector("#weekly-duration");

  countTrainings.textContent = workouts.length;
  totalTime.textContent = `${sumMinutes(workouts)} хв`;
  averageTime.textContent = `${workouts.length !== 0 ? Math.round(sumMinutes(workouts) / workouts.length) : 0} хв`;
  weeklyDurationElement.textContent = `${sumWeeklyDuration(workouts)} хв`;

  updateProgressBar(workouts);
}

// Функція для підрахунку загальної тривалості всіх тренувань у хв
function sumMinutes(arr) {
  let sum = 0;
  for (const item of arr) {
    sum += item.duration;
  }

  return sum;
}

// Функція оновлення прогрес-бару
function updateProgressBar(workouts) {
  const weeklyGoalText = document.querySelector("#weekly-goal-text");
  const progressBarFill = document.querySelector("#progress-bar-fill");
  const progressBar = document.querySelector("#progress-bar");
  const targetGoal = 5;

  const weeklyWorkouts = workouts.filter((item) =>
    isWithinCurrentWeek(item.date),
  );
  const currentCount = weeklyWorkouts.length;

  const progressPercent = Math.min(
    Math.round((currentCount / targetGoal) * 100),
    100,
  );

  weeklyGoalText.textContent = `${currentCount} / ${targetGoal}`;
  progressBarFill.style.width = `${progressPercent}%`;
  progressBarFill.classList.toggle("completed", currentCount >= targetGoal);

  progressBar.setAttribute("aria-valuenow", progressPercent);
}

// Функція, яка класифікує тренування за тривалістю
function classifyTraining(workout) {
  const shortTrainingMax = 30;

  if (workout.duration <= shortTrainingMax) {
    return "short";
  }

  return "long";
}

// Обробник події відправки даних форми
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const typeSelect = document.querySelector("#workout-type");
  const durationInput = document.querySelector("#duration-input");
  const dateInput = document.querySelector("#workout-date");

  const type = typeSelect.value;
  const duration = Number(durationInput.value);
  const date = dateInput.value;

  const newTraining = {
    type: type,
    duration: duration,
    date: date,
  };

  try {
    await addItem(newTraining);
    await refreshUI();
    form.reset();
  } catch (error) {
    console.error("Помилка збереження запису:", error);
    alert("Не вдалося зберегти тренування. Спробуйте ще раз.");
  }
});

// Обробник події введення даних про тривалість тренування
minutesInput.addEventListener("input", (event) => {
  const maxVal = 600;
  const minVal = 1;

  if (Number(minutesInput.value) > maxVal) {
    minutesInput.setCustomValidity(
      `Тривалість не може перевищувати ${maxVal} хв (10 годин)!`,
    );
  } else if (Number(minutesInput.value) < minVal) {
    minutesInput.setCustomValidity("Тривалість має бути щонайменше 1 хв!");
  } else {
    minutesInput.setCustomValidity("");
  }
});

// Функція для відображення помилок БД
function showDatabaseError(message) {
  const statusMessage = document.querySelector("#status-message");

  statusMessage.textContent = message;
  statusMessage.classList.remove("loading");
  statusMessage.classList.add("visible", "error");
}

let workouts = [];

// Функція для оновлення карток та статистики
async function refreshUI() {
  workouts = await getAllItems();
  renderCards(workouts);
  updateStatistics(workouts);
  animateWeeklyChart(workouts);
}

// Функція початкової ініціалізації сайту
async function init() {
  try {
    await openDB();
  } catch (error) {
    console.error("Помилка відкриття IndexedDB:", error);
    showDatabaseError(
      "Сховище IndexedDB недоступне. Тренування не можуть бути завантажені.",
    );
    return;
  }

  await migrateFromLocalStorage();

  let items = await getAllItems();
  if (items.length === 0) {
    for (const item of defaultWorkouts) {
      await addItem(item);
    }
  }

  await refreshUI();
}

let chartAnimationId = null;

// Функція для анімованого зображення графіка
function animateWeeklyChart(workouts) {
  const chartCanvas = document.querySelector("#weekly-chart");
  if (!chartCanvas) return;
  const chartCtx = chartCanvas.getContext("2d");

  if (chartAnimationId) {
    cancelAnimationFrame(chartAnimationId);
  }

  const dayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const dailyDurations = [0, 0, 0, 0, 0, 0, 0];

  const currentWeekWorkouts = workouts.filter((item) =>
    isWithinCurrentWeek(item.date),
  );

  for (const item of currentWeekWorkouts) {
    const workoutDate = new Date(item.date);
    const dayIndex = (workoutDate.getDay() + 6) % 7;
    dailyDurations[dayIndex] += Number(item.duration) || 0;
  }

  const maxVal = Math.max(...dailyDurations, 60);
  const paddingBottom = 26;
  const paddingTop = 22;
  const chartHeight = chartCanvas.height - paddingBottom - paddingTop;
  const barCount = dailyDurations.length;
  const barWidth = 22;
  const gap = (chartCanvas.width - barWidth * barCount) / (barCount + 1);

  let progress = 0;

  function renderFrame() {
    progress += 0.05;
    if (progress > 1) {
      progress = 1;
    }

    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    dailyDurations.forEach((duration, i) => {
      const x = gap + i * (barWidth + gap);

      const targetHeight = duration > 0 ? (duration / maxVal) * chartHeight : 2;
      const currentHeight = targetHeight * progress;
      const y = chartCanvas.height - paddingBottom - currentHeight;

      chartCtx.fillStyle = duration > 0 ? "#ff6b00" : "#2a2a2a";
      chartCtx.fillRect(x, y, barWidth, currentHeight);

      chartCtx.fillStyle = "#a0a0a0";
      chartCtx.font = "12px Roboto, sans-serif";
      chartCtx.textAlign = "center";
      chartCtx.fillText(dayLabels[i], x + barWidth / 2, chartCanvas.height - 8);

      if (duration > 0 && progress >= 0.8) {
        chartCtx.fillStyle = "#ffffff";
        chartCtx.font = "10px Roboto, sans-serif";
        chartCtx.fillText(`${duration}`, x + barWidth / 2, y - 6);
      }
    });

    if (progress < 1) {
      chartAnimationId = requestAnimationFrame(renderFrame);
    } else {
      chartAnimationId = null;
    }
  }

  chartAnimationId = requestAnimationFrame(renderFrame);
}

// Обробник події для зупинки анімації при перемиканні вкладок браузера
document.addEventListener("visibilitychange", () => {
  if (document.hidden && chartAnimationId) {
    cancelAnimationFrame(chartAnimationId);
    chartAnimationId = null;
  }
});

const weeklyCanvas = document.querySelector("#weekly-chart");

// Зупинка анімації, якщо canvas не в зоні видимості
if (weeklyCanvas && "IntersectionObserver" in window) {
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Якщо полотно вийшло за межі viewport під час активного циклу — скасовуємо кадри
        if (!entry.isIntersecting && chartAnimationId) {
          cancelAnimationFrame(chartAnimationId);
          chartAnimationId = null;
        }
      });
    },
    { threshold: 0.1 },
  );

  chartObserver.observe(weeklyCanvas);
}

init();
