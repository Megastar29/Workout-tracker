const allCards = document.querySelectorAll(".card");
allCards.forEach((x) => x.remove());

const workouts = [
    { type: "Командний спорт", minutes: 40, calories: 600 },
    { type: "Кардіо", minutes: 5, calories: 100 },
    { type: "Силове", minutes: 30, calories: 800 },
];

const listContainer = document.querySelector("#workouts-list");

function renderCards(workouts) {
    const shortTrainingMax = 30;
    listContainer.innerHTML = "";
    for (const workout of workouts) {
        const card = document.createElement("article");
        const type = document.createElement("h3");
        const details = document.createElement("p");

        type.textContent = workout.type;
        details.textContent = `${workout.minutes} хв, ${workout.calories} ккал`;

        card.dataset.calories = workout.calories;

        if (workout.minutes <= shortTrainingMax) {
            card.classList.add("short");
        } else {
            card.classList.add("long");
        }

        card.append(type);
        card.append(details);
        listContainer.append(card);
    }
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
function classifyTrainings(arr) {
    const shortTrainingMax = 30;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].minutes <= shortTrainingMax) {
            console.log(arr[i].type + ": " + "Коротке");
        } else {
            console.log(arr[i].type + ": " + "Довге");
        }
    }
}

// Функція розрахунку кількості спалених калорій за хвилину тренування
const caloriesPerMinute = (w) => Math.round(w.calories / w.minutes);

console.log("Сума спалених калорій: " + sumCalories(workouts));
classifyTrainings(workouts);

for (const workout of workouts) {
    console.log(
        "Тренування: " +
            workout.type +
            " -> " +
            caloriesPerMinute(workout) +
            " кал/хв",
    );
}

renderCards(workouts);
