// Компонент даних
const WorkoutRow = {
  props: ["id", "type", "minutes", "calories"],
  emits: ["delete-workout"],

  computed: {
    caloriesPerMinute() {
      if (!this.minutes || this.minutes === 0) return 0;
      return (this.calories / this.minutes).toFixed(1);
    },

    durationClass() {
      const shortTrainingMax = 30;
      return this.minutes <= shortTrainingMax ? "short" : "long";
    },
  },

  template: `
    <article class="card" :class="durationClass">
      <div class="card-header">
        <h3>{{ type }}</h3>
        <button 
          type="button" 
          class="card-delete-btn"
          @click="$emit('delete-workout', id)" 
          title="Видалити"
        >&times;</button>
      </div>
      <p>{{ minutes }} хв, {{ calories }} ккал</p>
      <p class="card-intensity">{{ caloriesPerMinute }} ккал/хв</p>
    </article>
  `,
};

const URL = "https://jsonplaceholder.typicode.com/todos?userId=4";

/*
 * Обраний фреймворк: Vue 3 (CDN, декларативний підхід).
 * Причина вибору: швидка інтеграція без необхідності налаштування складних
 * збирачів (Vite/Webpack), зручна робота з реактивними даними та наявність
 * computed properties для автоматичного обчислення похідного значення (ккал/хв).
 */
// Робота із Vue - створення додатку
Vue.createApp({
  components: {
    WorkoutRow,
  },

  data() {
    return {
      workouts: [
        { id: 1, type: "Командний спорт", minutes: 40, calories: 600 },
        { id: 2, type: "Кардіо", minutes: 15, calories: 100 },
        { id: 3, type: "Силове", minutes: 30, calories: 800 },
      ],

      form: {
        type: "",
        minutes: null,
        calories: null,
      },

      isLoading: false,
      statusMessage: "",
      isError: false,
    };
  },

  computed: {
    formIntensity() {
      if (
        !this.form.minutes ||
        this.form.minutes <= 0 ||
        !this.form.calories ||
        this.form.calories <= 0
      ) {
        return 0;
      }

      return (this.form.calories / this.form.minutes).toFixed(1);
    },

    totalTrainings() {
      return this.workouts.length;
    },

    totalMinutes() {
      return this.workouts.reduce((sum, w) => sum + Number(w.minutes || 0), 0);
    },

    averageMinutes() {
      if (this.totalTrainings === 0) return 0;

      return Math.round(this.totalMinutes / this.totalTrainings);
    },

    totalCalories() {
      return this.workouts.reduce((sum, w) => sum + Number(w.calories || 0), 0);
    },

    weeklyProgressPercent() {
      const targetGoal = 5;
      return Math.min(
        Math.round((this.totalTrainings / targetGoal) * 100),
        100,
      );
    },
  },

  methods: {
    removeWorkout(id) {
      this.workouts = this.workouts.filter((w) => w.id !== id);
    },

    addWorkout() {
      if (!this.form.type || !this.form.minutes || !this.form.calories) {
        return;
      }

      const maxId =
        this.workouts.length > 0
          ? Math.max(...this.workouts.map((w) => w.id))
          : 0;

      this.workouts.push({
        id: maxId + 1,
        type: this.form.type,
        minutes: Number(this.form.minutes),
        calories: Number(this.form.calories),
      });

      this.form.type = "";
      this.form.minutes = null;
      this.form.calories = null;
    },

    async loadData() {
      this.isLoading = true;
      this.statusMessage = "Завантаження тренувань...";
      this.isError = false;

      try {
        const response = await fetch(URL);
        if (!response.ok) {
          throw new Error(`Код ${response.status}`);
        }

        const data = await response.json();
        this.workouts = data.map((item) => ({
          id: item.id,
          type: item.title,
          minutes: item.id % 2 === 0 ? 45 : 20,
          calories: item.id % 2 === 0 ? 350 : 150,
        }));
        this.statusMessage = "";
      } catch (error) {
        this.isError = true;
        this.statusMessage = "Журнал тренувань недоступний офлайн";
      } finally {
        this.isLoading = false;
      }
    },
  },
}).mount("#app");