<script setup lang="ts">
type Quiz = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  materialId: string;
  createdAt: string;
  updatedAt: string;
};

type Result = {
  quiz: Quiz;
  selectedAnswer: string;
  isCorrect: boolean;
};

const route = useRoute();
const materialId = route.params.id as string;
const materialTitle = ref("");
const quizzes = ref<Quiz[]>([]);
const loading = ref(true);
const error = ref<any>(null);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref("");
const results = ref<Result[]>([]);

const supabaseUser = useSupabaseUser();
const toast = useToast();

// Computed properties
const currentQuestion = computed(
  () => quizzes.value[currentQuestionIndex.value],
);
const options = computed(() => [
  { labelLetter: "A", value: "a", label: currentQuestion.value?.optionA || "" },
  { labelLetter: "B", value: "b", label: currentQuestion.value?.optionB || "" },
  { labelLetter: "C", value: "c", label: currentQuestion.value?.optionC || "" },
  { labelLetter: "D", value: "d", label: currentQuestion.value?.optionD || "" },
]);

const correctAnswers = computed(
  () => results.value.filter((r) => r.isCorrect).length,
);
const score = computed(() =>
  Math.round((correctAnswers.value / quizzes.value.length) * 100),
);
const quizPassed = computed(() => score.value >= 70);

// Methods
const fetchQuizzesByMaterial = async () => {
  try {
    const response = await $fetch(`/api/quiz/by-material/${materialId}`);
    quizzes.value = response.data as Quiz[];

    const materialResponse = await $fetch(
      `/api/learning-materials/${materialId}`,
    );
    materialTitle.value = materialResponse.data.title;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal memuat quiz",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    loading.value = false;
  }
};

const selectAnswer = (answer: string) => {
  selectedAnswer.value = answer;
};

const submitAnswer = () => {
  if (!selectedAnswer.value) return;

  const quiz = currentQuestion.value;
  const isCorrect = selectedAnswer.value === quiz.correctAnswer;

  results.value.push({
    quiz,
    selectedAnswer: selectedAnswer.value,
    isCorrect,
  });

  selectedAnswer.value = "";
  currentQuestionIndex.value++;
};

const resetQuiz = () => {
  currentQuestionIndex.value = 0;
  results.value = [];
};

const saveQuizAttempt = async () => {
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
    await $fetch("/api/quiz-attempts", {
      method: "POST",
      body: {
        userId: supabaseUser.value.id,
        materialId,
        score: correctAnswers.value,
        totalQuestions: quizzes.value.length,
      },
    });

    toast.add({
      title: "Berhasil",
      description: "Hasil quiz berhasil disimpan",
      color: "green",
      icon: "i-heroicons-check-circle-20-solid",
    });

    navigateTo("/materi");
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err.data?.message || "Gagal menyimpan hasil quiz",
      color: "red",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchQuizzesByMaterial);
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
          <p class="text-gray-600">Memuat quiz...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex h-full items-center justify-center">
        <UAlert
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="error"
          variant="solid"
          :title="error"
          class="w-full max-w-xl"
        />
      </div>

      <!-- Quiz Content -->
      <div v-else class="mx-auto w-full">
        <!-- Quiz Header -->
        <div class="mb-6 space-y-3 text-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Quiz: {{ materialTitle }}
          </h1>
          <UBadge color="primary" variant="subtle" class="text-sm">
            Total Pertanyaan: {{ quizzes.length }}
          </UBadge>
        </div>

        <!-- Quiz Questions -->
        <div v-if="quizzes.length === 0" class="text-center text-gray-600">
          Belum ada quiz untuk materi ini.
        </div>

        <div v-else>
          <!-- Ongoing Quiz -->
          <div v-if="currentQuestionIndex < quizzes.length" class="space-y-6">
            <!-- Question Progress -->
            <div class="flex items-center justify-between">
              <UBadge color="neutral" variant="subtle" class="text-sm">
                Pertanyaan {{ currentQuestionIndex + 1 }}/{{ quizzes.length }}
              </UBadge>
              <UBadge color="primary" variant="subtle" class="text-sm">
                Nilai: {{ score }}
              </UBadge>
            </div>

            <!-- Question Content -->
            <div class="rounded-xl border bg-white p-4 shadow">
              <article class="prose prose-sm max-w-none">
                <div
                  class="text-gray-900 [&_code]:rounded-md [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:text-sm [&_img]:mx-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border"
                  v-html="currentQuestion.question"
                />
              </article>

              <!-- Answer Options -->
              <div class="mt-4 space-y-3">
                <UButton
                  v-for="(option, index) in options"
                  :key="index"
                  :variant="
                    selectedAnswer === option.value ? 'solid' : 'outline'
                  "
                  :color="
                    selectedAnswer === option.value ? 'primary' : 'neutral'
                  "
                  class="h-auto min-h-10 w-full justify-start text-left"
                  @click="selectAnswer(option.value)"
                >
                  <template #leading>
                    <span class="mr-3 font-medium"
                      >{{ option.labelLetter }}.</span
                    >
                  </template>
                  <span class="text-base">{{ option.label }}</span>
                </UButton>
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

          <!-- Quiz Results -->
          <div v-else class="space-y-6">
            <!-- Result Summary -->
            <div
              class="rounded-xl border p-6 text-center"
              :class="{
                'border-green-200 bg-green-50': quizPassed,
                'border-red-200 bg-red-50': !quizPassed,
              }"
            >
              <UIcon
                :name="
                  quizPassed
                    ? 'i-heroicons-check-circle-20-solid'
                    : 'i-heroicons-x-circle-20-solid'
                "
                class="mx-auto h-14 w-14"
                :class="quizPassed ? 'text-green-500' : 'text-red-500'"
              />
              <h2 class="mt-4 text-xl font-bold text-gray-900">
                {{ quizPassed ? "Selamat!" : "Belum Lulus" }}
              </h2>
              <p class="mt-2 text-2xl font-bold text-gray-900">
                {{ score }} / 100
              </p>
              <p class="mt-2 text-gray-600">
                {{
                  quizPassed ? "🎉 Nilai mencukupi" : "😞 Perlu 70+ untuk lulus"
                }}
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
                  class="prose prose-sm mt-2 [&_img]:mx-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border"
                  v-html="result.quiz.question"
                />

                <div class="mt-4 grid grid-cols-1 gap-3">
                  <div>
                    <p class="text-sm text-gray-500">Jawaban kamu:</p>
                    <p
                      class="text-lg font-medium"
                      :class="
                        result.isCorrect ? 'text-green-600' : 'text-red-600'
                      "
                    >
                      {{ result.selectedAnswer.toUpperCase() }}
                    </p>
                  </div>
                  <div v-if="!result.isCorrect">
                    <p class="text-sm text-gray-500">Jawaban benar:</p>
                    <p class="text-lg font-medium text-green-600">
                      {{ result.quiz.correctAnswer.toUpperCase() }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <UButton
                v-if="!quizPassed"
                label="Coba Lagi"
                icon="i-heroicons-arrow-path-20-solid"
                color="primary"
                size="lg"
                class="w-full"
                @click="resetQuiz"
              />
              <UButton
                v-if="quizPassed"
                label="Simpan Hasil"
                icon="i-heroicons-document-arrow-down-20-solid"
                color="primary"
                size="lg"
                class="w-full"
                @click="saveQuizAttempt"
              />
              <UButton
                :to="`/materi/${materialId}`"
                label="Kembali ke Materi"
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
