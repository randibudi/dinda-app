<script setup lang="ts">
import type { Exercise, ExerciseQuestion } from "~/types";

const route = useRoute();
const exerciseId = route.params.id as string;
const exercise = ref<Exercise | null>(null);
const loading = ref(true);
const error = ref<any>(null);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref<"benar" | "salah" | null>(null);
const results = ref<
  {
    question: ExerciseQuestion;
    selectedAnswer: "benar" | "salah";
    isCorrect: boolean;
  }[]
>([]);
const toast = useToast();
const supabaseUser = useSupabaseUser();

// Computed properties
const currentQuestion = computed(() => {
  if (!exercise.value) return null;
  return exercise.value.questions[currentQuestionIndex.value];
});

const totalQuestions = computed(() => {
  return exercise.value?.questions?.length || 0;
});

const correctAnswers = computed(
  () => results.value.filter((r) => r.isCorrect).length,
);

const score = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return Math.round((correctAnswers.value / totalQuestions.value) * 100);
});

const exercisePassed = computed(() => score.value >= 70);

// Fetch exercise by ID
const fetchExercise = async () => {
  try {
    const response = await $fetch(`/api/exercises/${exerciseId}`);
    exercise.value = response.data;
  } catch (err: any) {
    error.value = err;
    toast.add({
      title: "Error",
      description: error.value?.data?.message || "Gagal memuat latihan",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    loading.value = false;
  }
};

// Select answer
const selectAnswer = (answer: "benar" | "salah") => {
  selectedAnswer.value = answer;
};

// Submit answer
const submitAnswer = () => {
  if (!selectedAnswer.value || !currentQuestion.value) return;

  const isCorrect =
    selectedAnswer.value === currentQuestion.value.correctAnswer;

  results.value.push({
    question: currentQuestion.value,
    selectedAnswer: selectedAnswer.value,
    isCorrect,
  });

  selectedAnswer.value = null;
  currentQuestionIndex.value++;
};

// Reset exercise
const resetExercise = () => {
  currentQuestionIndex.value = 0;
  results.value = [];
};

// Save exercise attempt
const saveExerciseAttempt = async () => {
  if (!supabaseUser.value) {
    toast.add({
      title: "Error",
      description: "Silakan login terlebih dahulu",
      color: "red",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
    return;
  }

  try {
    await $fetch("/api/exercise-attempts", {
      method: "POST",
      body: {
        userId: supabaseUser.value.id,
        exerciseId,
        score: score.value,
        totalQuestions: totalQuestions.value,
      },
    });

    toast.add({
      title: "Berhasil",
      description: "Hasil latihan berhasil disimpan",
      color: "green",
      icon: "i-heroicons-check-circle-20-solid",
    });

    navigateTo("/latihan");
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err.data?.message || "Gagal menyimpan hasil latihan",
      color: "red",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchExercise);
</script>

<template>
  <NuxtLayout>
    <div class="w-full bg-gray-50 p-4">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex h-full w-full items-center justify-center"
      >
        <div class="flex flex-col items-center space-y-4">
          <UIcon
            name="i-proicons:spinner"
            class="text-primary-500 h-12 w-12 animate-spin"
          />
          <p class="text-gray-600">Memuat latihan...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex h-full items-center justify-center">
        <UAlert
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="error"
          variant="solid"
          :title="error.message || 'Terjadi kesalahan'"
          class="w-full max-w-xl"
        />
      </div>

      <!-- Exercise Content -->
      <div v-else-if="exercise" class="mx-auto w-full max-w-3xl">
        <!-- Exercise Header -->
        <div class="mb-6 space-y-3 text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ exercise.title }}
          </h1>
          <p class="text-gray-600">{{ exercise.description }}</p>
          <div class="flex items-center justify-center gap-4">
            <UBadge color="primary" variant="subtle" class="text-sm">
              Kelas: {{ exercise.grade }}
            </UBadge>
            <UBadge color="primary" variant="subtle" class="text-sm">
              Total Soal: {{ totalQuestions }}
            </UBadge>
          </div>
        </div>

        <div>
          <!-- Ongoing Exercise -->
          <div v-if="currentQuestionIndex < totalQuestions" class="space-y-6">
            <!-- Question Progress -->
            <div class="flex items-center justify-between">
              <UBadge color="neutral" variant="subtle" class="text-sm">
                Pertanyaan {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
              </UBadge>
            </div>

            <!-- Question Content -->
            <div class="rounded-xl border bg-white p-6 shadow">
              <div class="prose prose-sm max-w-none">
                <div class="text-gray-900" v-html="currentQuestion?.question" />
              </div>

              <!-- Answer Options -->
              <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <UButton
                  label="Benar"
                  :variant="selectedAnswer === 'benar' ? 'solid' : 'outline'"
                  :color="selectedAnswer === 'benar' ? 'primary' : 'neutral'"
                  size="xl"
                  class="h-16"
                  @click="selectAnswer('benar')"
                />
                <UButton
                  label="Salah"
                  :variant="selectedAnswer === 'salah' ? 'solid' : 'outline'"
                  :color="selectedAnswer === 'salah' ? 'primary' : 'neutral'"
                  size="xl"
                  class="h-16"
                  @click="selectAnswer('salah')"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <UButton
              :disabled="!selectedAnswer"
              label="Lanjutkan"
              icon="i-heroicons-arrow-right-20-solid"
              color="primary"
              size="lg"
              class="w-full"
              trailing
              @click="submitAnswer"
            />
          </div>

          <!-- Exercise Results -->
          <div v-else class="space-y-6">
            <!-- Result Summary -->
            <div
              class="rounded-xl border p-6 text-center"
              :class="{
                'border-green-200 bg-green-50': exercisePassed,
                'border-red-200 bg-red-50': !exercisePassed,
              }"
            >
              <UIcon
                :name="
                  exercisePassed
                    ? 'i-heroicons-check-circle-20-solid'
                    : 'i-heroicons-x-circle-20-solid'
                "
                class="mx-auto h-14 w-14"
                :class="exercisePassed ? 'text-green-500' : 'text-red-500'"
              />
              <h2 class="mt-4 text-xl font-bold text-gray-900">
                {{ exercisePassed ? "Selamat!" : "Belum Lulus" }}
              </h2>
              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ score }} / 100
              </p>
              <p class="mt-2 text-gray-600">
                {{
                  exercisePassed
                    ? "🎉 Nilai mencukupi"
                    : "😞 Perlu 70+ untuk lulus"
                }}
              </p>
              <p class="mt-1 text-gray-600">
                Jawaban benar: {{ correctAnswers }} dari
                {{ totalQuestions }} soal
              </p>
            </div>

            <!-- Detailed Results -->
            <div class="space-y-4">
              <div
                v-for="(result, index) in results"
                :key="index"
                class="rounded-lg border bg-white p-4"
              >
                <div class="text-lg font-medium text-gray-900">
                  Pertanyaan {{ index + 1 }}
                </div>
                <div
                  class="prose prose-sm mt-2"
                  v-html="result.question.question"
                />

                <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p class="text-sm text-gray-500">Jawaban kamu:</p>
                    <UBadge
                      :color="result.isCorrect ? 'green' : 'red'"
                      variant="subtle"
                      class="text-lg font-medium"
                    >
                      {{ result.selectedAnswer }}
                    </UBadge>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Jawaban benar:</p>
                    <UBadge
                      color="green"
                      variant="subtle"
                      class="text-lg font-medium"
                    >
                      {{ result.question.correctAnswer }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <UButton
                v-if="!exercisePassed"
                label="Coba Lagi"
                icon="i-heroicons-arrow-path-20-solid"
                color="primary"
                size="lg"
                class="w-full"
                @click="resetExercise"
              />
              <UButton
                v-if="exercisePassed"
                label="Simpan Hasil"
                icon="i-heroicons-document-arrow-down-20-solid"
                color="primary"
                size="lg"
                class="w-full"
                @click="saveExerciseAttempt"
              />
              <UButton
                to="/latihan"
                label="Kembali ke Daftar Latihan"
                variant="outline"
                color="neutral"
                size="lg"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
