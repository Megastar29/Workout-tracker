const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const workouts = [
  { type: "Командний спорт", minutes: 40, calories: 600 },
  { type: "Кардіо", minutes: 15, calories: 100 },
  { type: "Силове", minutes: 30, calories: 800 },
];

const listContainer = document.querySelector("#workouts-list");

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

function updateStatistics(workouts) {
  const countTrainings = document.querySelector("#count-trainings");
  const totalTime = document.querySelector("#total-time");
  const averageTime = document.querySelector("#average-time");
  const totalCaloriesElement = document.querySelector("#total-calories");

  countTrainings.innerHTML = `<span class="statistics-label">Кількість тренувань:</span>
          <span class="statistics-value">${workouts.length}</span>`;

  totalTime.innerHTML = `<span class="statistics-label">Загальний час:</span>
          <span class="statistics-value">${sumMinutes(workouts)} хв</span>`;

  averageTime.innerHTML = `<span class="statistics-label">Середній час тренування:</span>
          <span class="statistics-value">${Math.round(sumMinutes(workouts) / workouts.length)} хв</span>`;

  totalCaloriesElement.innerHTML = `<span class="statistics-label">Спалені калорії:</span>
          <span class="statistics-value">${sumCalories(workouts)} ккал</span>`;
}

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

renderCards(workouts);
updateStatistics(workouts);
