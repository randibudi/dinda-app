<script setup lang="ts">
import type { ExerciseQuestion } from "~/server/db/schema";

const toast = useToast();

// State untuk form
const state = ref({
  title: "",
  description: "",
  grade: "IV",
  questions: [{ question: "", correctAnswer: "benar" } as ExerciseQuestion],
});

// Validasi apakah form bisa disubmit
const canSubmit = computed(() => {
  return (
    state.value.title.trim() !== "" &&
    state.value.questions.length > 0 &&
    state.value.questions.every(
      (q) =>
        q.question.trim() !== "" &&
        (q.correctAnswer === "benar" || q.correctAnswer === "salah"),
    )
  );
});

// Opsi kelas
const grades = ["I", "II", "III", "IV", "V", "VI"];

// Opsi jawaban
const answerOptions = [
  { value: "benar", label: "Benar" },
  { value: "salah", label: "Salah" },
];

// Status loading
const isLoading = ref(false);

// Fungsi untuk menambah soal baru
const addQuestion = () => {
  state.value.questions.push({
    question: "",
    correctAnswer: "benar",
  });
};

// Fungsi untuk menghapus soal
const removeQuestion = (index: number) => {
  if (state.value.questions.length > 1) {
    state.value.questions.splice(index, 1);
  }
};

// Fungsi untuk membuat latihan baru
const createExercise = async () => {
  try {
    isLoading.value = true;

    // Dapatkan user yang sedang login
    const user = useSupabaseUser();
    if (!user.value) {
      throw new Error("Anda harus login untuk membuat latihan");
    }

    // Kirim data ke API
    const { data, error } = await useFetch("/api/exercises", {
      method: "POST",
      body: {
        title: state.value.title,
        description: state.value.description,
        grade: state.value.grade,
        authorId: user.value.id,
        questions: state.value.questions,
      },
    });

    if (error.value) {
      throw new Error(error.value.data?.message || "Gagal membuat latihan");
    }

    // Tampilkan notifikasi sukses
    toast.add({
      title: "Sukses!",
      description: "Latihan berhasil dibuat",
      color: "success",
    });

    // Reset form
    state.value = {
      title: "",
      description: "",
      grade: "IV",
      questions: [{ question: "", correctAnswer: "benar" }],
    };

    // Navigasi ke halaman daftar latihan
    await navigateTo("/admin/latihan");
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.message || "Terjadi kesalahan saat membuat latihan",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <NuxtLayout>
      <div>
        <h1 class="mb-6 text-2xl font-bold">Tambah Latihan Baru</h1>

        <UForm :state="state" @submit="createExercise">
          <!-- Judul Latihan -->
          <UFormGroup label="Judul Latihan" name="title" required>
            <UInput
              v-model="state.title"
              placeholder="Masukkan judul latihan"
              size="lg"
              class="mb-6 w-full"
            />
          </UFormGroup>

          <!-- Deskripsi -->
          <UFormGroup label="Deskripsi" name="description">
            <UTextarea
              v-model="state.description"
              placeholder="Masukkan deskripsi latihan (opsional)"
              size="lg"
              class="mb-6 w-full"
            />
          </UFormGroup>

          <!-- Kelas -->
          <UFormGroup label="Kelas" name="grade" required>
            <USelect
              v-model="state.grade"
              :items="grades"
              placeholder="Pilih kelas"
              size="lg"
              class="mb-6 w-full"
            />
          </UFormGroup>

          <!-- Daftar Soal -->
          <div>
            <h2 class="mb-4 text-xl font-semibold">Soal-soal Latihan</h2>

            <div
              v-for="(question, index) in state.questions"
              :key="index"
              class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-lg font-medium">Soal {{ index + 1 }}</h3>
                <UButton
                  v-if="state.questions.length > 1"
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  @click="removeQuestion(index)"
                />
              </div>

              <!-- Pertanyaan -->
              <UFormGroup
                :label="`Pertanyaan ${index + 1}`"
                :name="`question-${index}`"
                required
              >
                <TinymceEditor v-model="question.question" />
              </UFormGroup>

              <!-- Jawaban Benar -->
              <UFormGroup
                :label="`Jawaban Benar untuk Soal ${index + 1}`"
                :name="`correctAnswer-${index}`"
                required
              >
                <USelect
                  v-model="question.correctAnswer"
                  :items="answerOptions"
                  placeholder="Pilih jawaban benar"
                  size="lg"
                />
              </UFormGroup>
            </div>

            <!-- Tombol Tambah Soal -->
            <UButton
              color="primary"
              variant="outline"
              icon="i-heroicons-plus"
              @click="addQuestion"
              class="mb-4 w-full"
            >
              Tambah Soal
            </UButton>
          </div>

          <!-- Tombol Simpan -->
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="isLoading"
            :disabled="!canSubmit"
            class="w-full"
          >
            Simpan Latihan
          </UButton>
        </UForm>
      </div>
    </NuxtLayout>
  </div>
</template>
