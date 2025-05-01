<script setup lang="ts">
type LearningMaterial = {
  id: string;
  title: string;
  content: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type QuizData = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "a" | "b" | "c" | "d";
  materialId: string;
  createdAt: string;
  updatedAt: string;
};

const route = useRoute();
const quizId = route.params.id as string;
const question = ref("");
const optionA = ref("");
const optionB = ref("");
const optionC = ref("");
const optionD = ref("");
const correctAnswer = ref<"a" | "b" | "c" | "d">("a");
const materialId = ref("");
const data = ref<LearningMaterial[]>([]);
const isLoading = ref(false);
const toast = useToast();

const fetchLearningMaterials = async () => {
  const response = await $fetch("/api/learning-materials");
  data.value = response.data as LearningMaterial[];
};

const fetchQuizData = async () => {
  try {
    const response = await $fetch(`/api/quiz/${quizId}`);
    const quiz = response.data as QuizData;

    question.value = quiz.question;
    optionA.value = quiz.optionA;
    optionB.value = quiz.optionB;
    optionC.value = quiz.optionC;
    optionD.value = quiz.optionD;
    correctAnswer.value = quiz.correctAnswer;
    materialId.value = quiz.materialId;
  } catch (error) {
    toast.add({
      title: "Gagal Memuat Data",
      description: "Quiz tidak ditemukan atau terjadi kesalahan",
      color: "error",
    });
    await navigateTo("/admin/quiz");
  }
};

const handleUpdate = async () => {
  try {
    isLoading.value = true;

    const response = await $fetch(`/api/quiz/${quizId}`, {
      method: "PUT",
      body: {
        question: question.value,
        optionA: optionA.value,
        optionB: optionB.value,
        optionC: optionC.value,
        optionD: optionD.value,
        correctAnswer: correctAnswer.value,
        materialId: materialId.value,
      },
    });

    toast.add({
      title: "Berhasil!",
      description: "Quiz berhasil diperbarui",
      color: "success",
    });

    await navigateTo("/admin/quiz");
  } catch (error: any) {
    toast.add({
      title: "Gagal!",
      description: error.data?.message || error.message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchLearningMaterials(), fetchQuizData()]);
});
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="space-y-6">
        <UFormField label="Materi Pembelajaran Terkait" size="lg" required>
          <USelect
            v-model="materialId"
            :items="
              data?.map((material) => ({
                value: material.id,
                label: material.title,
              })) || []
            "
            placeholder="Pilih materi terkait"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Pertanyaan" size="lg" required>
          <TinymceEditor v-model="question" />
        </UFormField>

        <UFormField label="Opsi A" size="lg" required>
          <UInput
            v-model="optionA"
            type="text"
            placeholder="Masukkan opsi A"
            icon="i-mdi:alphabet-a-box"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Opsi B" size="lg" required>
          <UInput
            v-model="optionB"
            type="text"
            placeholder="Masukkan opsi B"
            icon="i-mdi:alphabet-b-box"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Opsi C" size="lg" required>
          <UInput
            v-model="optionC"
            type="text"
            placeholder="Masukkan opsi C"
            icon="i-mdi:alphabet-c-box"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Opsi D" size="lg" required>
          <UInput
            v-model="optionD"
            type="text"
            placeholder="Masukkan opsi D"
            icon="i-mdi:alphabet-d-box"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Jawaban Benar" size="lg" required>
          <USelect
            v-model="correctAnswer"
            :items="[
              { value: 'a', label: 'Opsi A' },
              { value: 'b', label: 'Opsi B' },
              { value: 'c', label: 'Opsi C' },
              { value: 'd', label: 'Opsi D' },
            ]"
            class="w-full"
          />
        </UFormField>

        <UButton
          block
          size="lg"
          :disabled="
            !question ||
            !optionA ||
            !optionB ||
            !optionC ||
            !optionD ||
            !materialId
          "
          :loading="isLoading"
          @click="handleUpdate"
        >
          Perbarui Quiz
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>
