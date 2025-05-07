<script setup lang="ts">
type LearningMaterial = {
  id: string;
  title: string;
  content: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const supabaseUser = useSupabaseUser();
const materials = ref<LearningMaterial[]>([]);
const quizAttempts = ref<any[]>([]);
const pagination = ref({ pageIndex: 1, pageSize: 5 });
const toast = useToast();

// Fetch materials and quiz attempts
const fetchData = async () => {
  try {
    const materialsRes = await $fetch("/api/learning-materials");
    materials.value = materialsRes.data;

    // Get user's quiz attempts
    if (supabaseUser.value?.id) {
      const attemptsRes = await $fetch(
        `/api/quiz-attempts/${supabaseUser.value.id}`,
      );
      quizAttempts.value = attemptsRes.data;
    }
  } catch (error) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal memuat data",
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

// Sort materials by creation date
const sortedMaterials = computed(() => {
  return [...materials.value].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
});

// Check if material is completed
const isMaterialCompleted = (materialId: string) => {
  return quizAttempts.value.some(
    (attempt) => attempt.materialId === materialId && attempt.score >= 70,
  );
};

// Check if material is locked
const isMaterialLocked = (index: number) => {
  if (index === 0) return false;
  const prevMaterial = sortedMaterials.value[index - 1];
  return !isMaterialCompleted(prevMaterial.id);
};

// Strip HTML tags from content
const strippedContent = (html: string) => {
  const stripped = html.replace(/<[^>]*>?/gm, "");
  return stripped.length > 200 ? `${stripped.slice(0, 200)}...` : stripped;
};

// Navigate to material page
const navigateToMaterial = (id: string) => {
  navigateTo(`/materi/${id}`);
};

onMounted(fetchData);
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-4xl px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">
          Materi Pembelajaran
        </h1>
        <p class="text-gray-600">Pilih materi untuk mulai belajar</p>
      </div>

      <!-- Materials List -->
      <div class="space-y-6">
        <TransitionGroup name="material-list">
          <div
            v-for="(material, index) in sortedMaterials"
            :key="material.id"
            class="relative"
          >
            <!-- Lock Overlay -->
            <div
              v-if="isMaterialLocked(index)"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/80 backdrop-blur-sm"
            >
              <UIcon
                name="i-heroicons-lock-closed"
                class="text-primary-500 h-8 w-8"
              />
              <p class="text-center text-sm text-gray-600">
                Selesaikan materi sebelumnya terlebih dahulu
              </p>
            </div>

            <!-- Material Card -->
            <UCard
              :class="[
                'relative overflow-hidden transition-all duration-200',
                isMaterialLocked(index)
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:shadow-lg',
              ]"
              :ui="{
                background: 'bg-white',
                header: { base: 'border-b' },
                footer: { base: 'border-t' },
              }"
              @click="
                !isMaterialLocked(index) && navigateToMaterial(material.id)
              "
            >
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-xl font-semibold text-gray-900">
                    {{ material.title }}
                  </h3>
                  <div class="flex items-center gap-2">
                    <UBadge
                      v-if="isMaterialCompleted(material.id)"
                      color="emerald"
                      variant="subtle"
                    >
                      Selesai
                    </UBadge>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(material.createdAt) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- Content Preview -->
              <p class="line-clamp-3 text-gray-600">
                {{ strippedContent(material.content) }}
              </p>

              <!-- Document Download -->
              <div v-if="material.documentUrl" class="pt-4">
                <UButton
                  :to="material.documentUrl"
                  target="_blank"
                  variant="outline"
                  color="primary"
                  icon="i-heroicons-document-arrow-down"
                  label="Download Dokumen"
                  trailing
                  @click.stop
                />
              </div>

              <!-- Card Footer -->
              <template #footer>
                <UButton
                  color="primary"
                  :disabled="isMaterialLocked(index)"
                  label="Pelajari Sekarang"
                  block
                  :trailing-icon="
                    isMaterialLocked(index)
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
          :total="sortedMaterials.length"
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
.material-list-enter-active,
.material-list-leave-active {
  transition: all 0.3s ease;
}

.material-list-enter-from,
.material-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
