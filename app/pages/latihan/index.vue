<script setup lang="ts">
import type { Exercise } from "~/types";

const supabaseUser = useSupabaseUser();
const exercises = ref<Exercise[]>([]);
const exerciseAttempts = ref<any[]>([]);
const pagination = ref({ pageIndex: 1, pageSize: 5 });
const toast = useToast();

// Fetch exercises and attempts
const fetchData = async () => {
  try {
    // Get all exercises
    const exercisesRes = await $fetch("/api/exercises");
    exercises.value = exercisesRes.data;

    // Get user's exercise attempts
    if (supabaseUser.value?.id) {
      const attemptsRes = await $fetch(
        `/api/exercise-attempts/${supabaseUser.value.id}`,
      );
      exerciseAttempts.value = attemptsRes.data;
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal memuat data latihan",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

// Format date to locale string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Sort exercises by creation date (oldest first)
const sortedExercises = computed(() => {
  return [...exercises.value].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
});

// Check if exercise is completed (score >= 70)
const isExerciseCompleted = (exerciseId: string) => {
  return exerciseAttempts.value.some(
    (attempt) => attempt.exerciseId === exerciseId && attempt.score >= 70,
  );
};

// Check if exercise is locked: locked if not the first and the previous one is not completed
const isExerciseLocked = (index: number) => {
  if (index === 0) return false;
  const prevExercise = sortedExercises.value[index - 1];
  return !isExerciseCompleted(prevExercise.id);
};

// Navigate to exercise page if not locked
const navigateToExercise = (id: string, index: number) => {
  if (!isExerciseLocked(index)) {
    navigateTo(`/latihan/${id}`);
  }
};

onMounted(fetchData);
</script>

<template>
  <NuxtLayout>
    <div class="px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">
          Latihan Pembelajaran
        </h1>
        <p class="text-gray-600">Pilih latihan untuk menguji pemahamanmu</p>
      </div>

      <!-- Exercises List -->
      <div class="space-y-6">
        <TransitionGroup name="exercise-list">
          <div
            v-for="(exercise, index) in sortedExercises"
            :key="exercise.id"
            class="relative"
          >
            <!-- Lock Overlay -->
            <div
              v-if="isExerciseLocked(index)"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 backdrop-blur-sm"
            >
              <UIcon
                name="i-heroicons-lock-closed"
                class="text-primary-500 h-8 w-8"
              />
              <p class="text-center text-sm text-gray-600">
                Selesaikan latihan sebelumnya terlebih dahulu
              </p>
            </div>

            <!-- Exercise Card -->
            <UCard
              :class="[
                'relative overflow-hidden transition-all duration-200',
                isExerciseLocked(index)
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:shadow-lg',
              ]"
              :ui="{
                background: 'bg-white',
                header: { base: 'border-b' },
                footer: { base: 'border-t' },
              }"
              @click="navigateToExercise(exercise.id, index)"
            >
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-xl font-semibold text-gray-900">
                    {{ exercise.title }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <UBadge
                      v-if="isExerciseCompleted(exercise.id)"
                      color="primary"
                      variant="subtle"
                    >
                      Selesai
                    </UBadge>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(exercise.createdAt) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- Description -->
              <p class="text-gray-600">
                {{
                  exercise.description || "Latihan untuk menguji pemahamanmu"
                }}
              </p>

              <!-- Info -->
              <div class="mt-4 flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <UIcon
                    name="i-heroicons-academic-cap"
                    class="text-gray-500"
                  />
                  <span class="text-sm">Kelas {{ exercise.grade }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon
                    name="i-heroicons-question-mark-circle"
                    class="text-gray-500"
                  />
                  <span class="text-sm">
                    {{ exercise.questions?.length || 0 }} Soal
                  </span>
                </div>
              </div>

              <!-- Card Footer -->
              <template #footer>
                <UButton
                  color="primary"
                  :disabled="isExerciseLocked(index)"
                  :label="
                    isExerciseCompleted(exercise.id)
                      ? 'Lihat Hasil'
                      : 'Mulai Latihan'
                  "
                  block
                  :trailing-icon="
                    isExerciseLocked(index)
                      ? 'i-heroicons-lock-closed'
                      : undefined
                  "
                />
              </template>
            </UCard>
          </div>
        </TransitionGroup>
      </div>

      <!-- Pagination Controls -->
      <div class="mt-8 flex justify-center">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="sortedExercises.length"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'h-8 w-8 min-w-8',
            rounded: 'rounded-full',
          }"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.exercise-list-enter-active,
.exercise-list-leave-active {
  transition: all 0.3s ease;
}

.exercise-list-enter-from,
.exercise-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
