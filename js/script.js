//Очищення статичних карток article
const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

let workouts = [
  { id: 1, type: "Командний спорт", duration: 40, date: "2026-10-12"},
  { id: 2, type: "Кардіо", duration: 15, date: "2026-10-14"},
  { id: 3, type: "Силове", duration: 30, date: "2026-10-17"},
];

// // Компонент даних
// const WorkoutRow = {
//   props: ["id", "type", "minutes", "calories"],
//   emits: ["delete-workout"],

//   computed: {
//     caloriesPerMinute() {
//       if (!this.minutes || this.minutes === 0) return 0;
//       return (this.calories / this.minutes).toFixed(1);
//     },
//   },

//   template: `
//     <article class="card">
//       <div class="card-header">
//         <h3>{{ type }}</h3>
//         <button 
//           type="button" 
//           class="card-delete-btn"
//           @click="$emit('delete-workout', id)" 
//           title="Видалити"
//         >&times;</button>
//       </div>
//       <p>{{ minutes }} хв, {{ calories }} ккал</p>
//       <p class="card-intensity">{{ caloriesPerMinute }} ккал/хв</p>
//     </article>
//   `,
// };

// /*
//  * Обраний фреймворк: Vue 3 (CDN, декларативний підхід).
//  * Причина вибору: швидка інтеграція без необхідності налаштування складних
//  * збирачів (Vite/Webpack), зручна робота з реактивними даними та наявність
//  * computed properties для автоматичного обчислення похідного значення (ккал/хв).
//  */
// // Робота із Vue - створення додатку
// Vue.createApp({
//   components: {
//     WorkoutRow,
//   },

//   data() {
//     return {
//       workouts: [
//         { id: 1, type: "Командний спорт", minutes: 40, calories: 600 },
//         { id: 2, type: "Кардіо", minutes: 15, calories: 100 },
//         { id: 3, type: "Силове", minutes: 30, calories: 800 },
//       ],
//     };
//   },

//   methods: {
//     removeWorkout(id) {
//       this.workouts = this.workouts.filter((w) => w.id !== id);
//     },
//   },
// }).mount("#app");

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

    if ("title" in workout) {
      type.textContent = workout.title;
      details.textContent = workout.completed ? "✓ Виконано" : "⏳ У процесі";

      card.classList.add(workout.completed ? "completed" : "not-completed");
    } else {
      type.textContent = workout.type;
      details.textContent = `${workout.duration} хв • ${workout.date}`;
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
    sum += item.duration;
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

  if (workout.duration <= shortTrainingMax) {
    return "short";
  }

  return "long";
}

// Функція розрахунку кількості спалених калорій за хвилину тренування
const caloriesPerMinute = (w) => Math.round(w.calories / w.duration);

// Обробник події відправки даних форми
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const typeSelect = document.querySelector("#workout-type");
  const durationInput = document.querySelector("#duration-input");
  const caloriesInput = document.querySelector("#calories-input");

  const type = typeSelect.value;
  const duration = Number(durationInput.value);
  const calories = Number(caloriesInput.value);

  const newTraining = { type: type, duration: duration, calories: calories };
  workouts.push(newTraining);
  renderCards(workouts);
  updateStatistics(workouts);

  form.reset();
  //cpmValue.textContent = "0";
});

// Функція-обробник події введення даних: оновлення розрахунку калорій/хвилину
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

// Обробник події введення даних про спалені калорії
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
