//Очищення статичних карток article
const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const defaultWorkouts = [
  { id: 1, type: "Командний спорт", duration: 40, date: "2026-10-12" },
  { id: 2, type: "Кардіо", duration: 15, date: "2026-10-14" },
  { id: 3, type: "Силове", duration: 30, date: "2026-10-17" },
];

const storage_key = "workouts";

function saveToLocalStorage(items) {
  localStorage.setItem(storage_key, JSON.stringify(items));
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(storage_key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Пошкоджені дані в localStorage:", error);
    return [];
  }
}

const savedData = loadFromLocalStorage();

let workouts = savedData.length > 0 ? savedData : [...defaultWorkouts];

if (savedData.length === 0) {
  saveToLocalStorage(workouts);
}

const URL = "https://jsonplaceholder.typicode.com/todos?userId=4";

const listContainer = document.querySelector("#workouts-list");
const form = document.querySelector("#workout-form");
const minutesInput = document.querySelector("#duration-input");
//const caloriesInput = document.querySelector("#calories-input");
//const cpmValue = document.querySelector("#cpm-value");

//Функція для рендеру карток за масивом даних
function renderCards(workouts) {
  listContainer.innerHTML = "";
  for (const workout of workouts) {
    const card = document.createElement("article");
    const type = document.createElement("h3");
    const details = document.createElement("p");
    card.classList.add("card");

    if ("title" in workout) {
      type.textContent = workout.title;
      details.textContent = workout.completed ? "✓ Виконано" : "⏳ У процесі";

      card.classList.add(workout.completed ? "completed" : "not-completed");
      card.append(type);
    } else {
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
    }

    card.append(details);
    listContainer.append(card);
  }
}

function deleteWorkout(id) {
  workouts = workouts.filter((item) => item.id !== id);

  saveToLocalStorage(workouts);

  renderCards(workouts);
  updateStatistics(workouts);
}

function isWithinCurrentWeek(dateString) {
  if (!dateString) return false;

  const workoutDate = new Date(dateString);
  const now = new Date();
  const sevenDaysInMonth = 7 * 24 * 60 * 60 * 1000;
  const diff = now - workoutDate;

  return diff >= 0 && diff <= sevenDaysInMonth;
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
  //const totalCaloriesElement = document.querySelector("#total-calories");
  const weeklyDurationElement = document.querySelector("#weekly-duration");

  countTrainings.textContent = workouts.length;
  totalTime.textContent = `${sumMinutes(workouts)} хв`;
  averageTime.textContent = `${workouts.length !== 0 ? Math.round(sumMinutes(workouts) / workouts.length) : 0} хв`;
  //totalCaloriesElement.textContent = `${sumCalories(workouts)} ккал`;
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

// Функція підрахунку усіх витрачених калорій впродовж тренувань
// function sumCalories(arr) {
//   let sum = 0;
//   for (let i = 0; i < arr.length; i++) {
//     sum += arr[i].calories;
//   }

//   return sum;
// }

// Функція оновлення прогрес-бару
function updateProgressBar(workouts) {
  const weeklyGoalText = document.querySelector("#weekly-goal-text");
  const progressBarFill = document.querySelector("#progress-bar-fill");
  const progressBar = document.querySelector("#progress-bar");
  const targetGoal = 5;
  const currentCount = workouts.length;

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

// Функція розрахунку кількості спалених калорій за хвилину тренування
// const caloriesPerMinute = (w) => Math.round(w.calories / w.duration);

// Обробник події відправки даних форми
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const typeSelect = document.querySelector("#workout-type");
  const durationInput = document.querySelector("#duration-input");
  //const caloriesInput = document.querySelector("#calories-input");
  const dateInput = document.querySelector("#workout-date");

  const type = typeSelect.value;
  const duration = Number(durationInput.value);
  //const calories = Number(caloriesInput.value);
  const date = dateInput.value;

  const maxId =
    workouts.length > 0 ? Math.max(...workouts.map((w) => w.id)) : 0;

  const newTraining = {
    id: maxId + 1,
    type: type,
    duration: duration,
    date: date,
  };

  workouts.push(newTraining);

  saveToLocalStorage(workouts);

  renderCards(workouts);
  updateStatistics(workouts);

  form.reset();
  //cpmValue.textContent = "0";
});

//Функція-обробник події введення даних: оновлення розрахунку калорій/хвилину
// function updateCaloriesPerMinutePreview() {
//   const durationInput = document.querySelector("#duration-input");
//   const minutes = Number(durationInput.value);
//   const calories = Number(caloriesInput.value);

//   if (minutes > 0 && calories > 0) {
//     cpmValue.textContent = caloriesPerMinute({
//       type: undefined,
//       duration: minutes,
//       calories: calories,
//     });
//   } else {
//     cpmValue.textContent = "0";
//   }
// }

//Обробник події введення даних про спалені калорії
// caloriesInput.addEventListener("input", (event) => {
//   const caloriesMaxVal = 2000;
//   const caloriesMinVal = 1;
//   if (Number(caloriesInput.value) < caloriesMinVal) {
//     caloriesInput.setCustomValidity(
//       `Потрібно ввести дані, більші ${caloriesMinVal}`,
//     );
//   } else if (Number(caloriesInput.value) > caloriesMaxVal) {
//     caloriesInput.setCustomValidity(
//       `Завелике число! Треба ввести дані менші за ${caloriesMaxVal}`,
//     );
//   } else {
//     caloriesInput.setCustomValidity("");
//   }
// });

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

//minutesInput.addEventListener("input", updateCaloriesPerMinutePreview);
//caloriesInput.addEventListener("input", updateCaloriesPerMinutePreview);

const refreshButton = document.querySelector("#refresh-button");
const statusMessage = document.querySelector("#status-message");

// Функція для відображення статусу завантаження для користувача
function showLoading(isLoading) {
  if (isLoading) {
    statusMessage.textContent = "Завантаження тренувань...";
    statusMessage.classList.remove("error");
    statusMessage.classList.add("visible", "loading");
  } else {
    statusMessage.classList.remove("loading");
    if (!statusMessage.classList.contains("error")) {
      statusMessage.classList.remove("visible");
      statusMessage.textContent = "";
    }
  }

  refreshButton.disabled = isLoading;
}

// Функція для відображення помилки для користувача
function showError(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("loading");
  statusMessage.classList.add("visible", "error");
}

// Функція завантаження даних із API
async function loadData() {
  showLoading(true);

  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`Код ${response.status}`);
    }

    const data = await response.json();
    renderCards(data);
    console.log(data);
  } catch (error) {
    showError("Журнал тренувань недоступний офлайн");
    console.error("Помилка завантаження даних:", error);
  } finally {
    showLoading(false);
  }
}

// Додаємо обробник події на натискання кнопки
refreshButton.addEventListener("click", () => {
  loadData();
});

renderCards(workouts);
updateStatistics(workouts);
//loadData();
