// Очищення статичних карток article
const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const workouts = [
  { type: "Командний спорт", minutes: 40, calories: 600 },
  { type: "Кардіо", minutes: 15, calories: 100 },
  { type: "Силове", minutes: 30, calories: 800 },
];

const listContainer = document.querySelector("#workouts-list");

// Функція для рендеру карток за масивом даних
function renderCards(workouts) {
  listContainer.innerHTML = "";
  for (const workout of workouts) {
    const card = document.createElement("article");
    const type = document.createElement("h3");
    const details = document.createElement("p");

    type.textContent = workout.type;
    details.textContent = `${workout.minutes} хв, ${workout.calories} ккал`;

    card.dataset.calories = workout.calories;
    card.classList.add("card");
    card.classList.add(classifyTraining(workout));

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
  averageTime.textContent = `${Math.round(sumMinutes(workouts) / workouts.length)} хв`;
  totalCaloriesElement.textContent = `${sumCalories(workouts)} ккал`;
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

// Функція, яка класифікує тренування за тривалістю
function classifyTraining(workout) {
  const shortTrainingMax = 30;

  if (workout.minutes <= shortTrainingMax) {
    return "short";
  }

  return "long";
}
// function classifyTrainings(arr) {
//     const shortTrainingMax = 30;

//     for (let i = 0; i < arr.length; i++) {
//         if (arr[i].minutes <= shortTrainingMax) {
//             console.log(arr[i].type + ": " + "Коротке");
//         } else {
//             console.log(arr[i].type + ": " + "Довге");
//         }
//     }
// }

// Функція розрахунку кількості спалених калорій за хвилину тренування
const caloriesPerMinute = (w) => Math.round(w.calories / w.minutes);

// console.log("Сума спалених калорій: " + sumCalories(workouts));
// classifyTrainings(workouts);

// for (const workout of workouts) {
//     console.log(
//         "Тренування: " +
//             workout.type +
//             " -> " +
//             caloriesPerMinute(workout) +
//             " кал/хв",
//     );
// }

const form = document.querySelector("#workout-form");
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
});

renderCards(workouts);
updateStatistics(workouts);
console.log("test1");