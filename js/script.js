// Очищення статичних карток article
const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const workouts = [
  { type: "Командний спорт", minutes: 40, calories: 600 },
  { type: "Кардіо", minutes: 15, calories: 100 },
  { type: "Силове", minutes: 30, calories: 800 },
];

const URL = "https://jsonplaceholder.typicode.com/todos?userId=4";

const listContainer = document.querySelector("#workouts-list");
const form = document.querySelector("#workout-form");
const minutesInput = document.querySelector("#duration-input");
const caloriesInput = document.querySelector("#calories-input");
const cpmValue = document.querySelector("#cpm-value");

// Функція для рендеру карток за масивом даних
function renderCards(workouts) {
  listContainer.innerHTML = "";
  for (const workout of workouts) {
    const card = document.createElement("article");
    const type = document.createElement("h3");
    const details = document.createElement("p");

    if ("title" in workout) {
      type.textContent = workout.title;
      details.textContent = workout.completed ? "✓ Виконано" : "⏳ У процесі";

      card.classList.add(workout.completed ? "completed" : "not-completed");
    } else {
      type.textContent = workout.type;
      details.textContent = `${workout.minutes} хв, ${workout.calories} ккал`;
      card.dataset.calories = workout.calories;
      card.classList.add(classifyTraining(workout));
    }
    card.classList.add("card");

    card.append(type);
    card.append(details);
    listContainer.append(card);
  }
}

// Функція для оновлення числових полів статистики
function updateStatistics(workouts) {
  const countTrainings = document.querySelector("#count-trainings");
  const totalTime = document.querySelector("#total-time");
  const averageTime = document.querySelector("#average-time");
  const totalCaloriesElement = document.querySelector("#total-calories");

  countTrainings.textContent = workouts.length;
  totalTime.textContent = `${sumMinutes(workouts)} хв`;
  averageTime.textContent = `${workouts.length !== 0 ? Math.round(sumMinutes(workouts) / workouts.length) : 0} хв`;
  totalCaloriesElement.textContent = `${sumCalories(workouts)} ккал`;

  updateProgressBar(workouts);
}

// Функція для підрахунку загальної тривалості всіх тренувань у хв
function sumMinutes(arr) {
  let sum = 0;
  for (const item of arr) {
    sum += item.minutes;
  }

  return sum;
}

// Функція підрахунку усіх витрачених калорій впродовж тренувань
function sumCalories(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i].calories;
  }

  return sum;
}

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

  if (workout.minutes <= shortTrainingMax) {
    return "short";
  }

  return "long";
}

// Функція розрахунку кількості спалених калорій за хвилину тренування
const caloriesPerMinute = (w) => Math.round(w.calories / w.minutes);

// Обробник події відправки даних форми
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const typeSelect = document.querySelector("#workout-type");
  const durationInput = document.querySelector("#duration-input");
  const caloriesInput = document.querySelector("#calories-input");

  const type = typeSelect.value;
  const duration = Number(durationInput.value);
  const calories = Number(caloriesInput.value);

  const newTraining = { type: type, minutes: duration, calories: calories };
  workouts.push(newTraining);
  renderCards(workouts);
  updateStatistics(workouts);

  form.reset();
  cpmValue.textContent = "0";
});

// Функція-обробник події введення даних: оновлення розрахунку калорій/хвилину
function updateCaloriesPerMinutePreview() {
  const durationInput = document.querySelector("#duration-input");
  const minutes = Number(durationInput.value);
  const calories = Number(caloriesInput.value);

  if (minutes > 0 && calories > 0) {
    cpmValue.textContent = caloriesPerMinute({
      type: undefined,
      minutes: minutes,
      calories: calories,
    });
  } else {
    cpmValue.textContent = "0";
  }
}

// Обробник події введення даних про спалені калорії
caloriesInput.addEventListener("input", (event) => {
  const caloriesMaxVal = 2000;
  const caloriesMinVal = 1;
  if (Number(caloriesInput.value) < caloriesMinVal) {
    caloriesInput.setCustomValidity(
      `Потрібно ввести дані, більші ${caloriesMinVal}`,
    );
  } else if (Number(caloriesInput.value) > caloriesMaxVal) {
    caloriesInput.setCustomValidity(
      `Завелике число! Треба ввести дані менші за ${caloriesMaxVal}`,
    );
  } else {
    caloriesInput.setCustomValidity("");
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

minutesInput.addEventListener("input", updateCaloriesPerMinutePreview);
caloriesInput.addEventListener("input", updateCaloriesPerMinutePreview);

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
loadData();
