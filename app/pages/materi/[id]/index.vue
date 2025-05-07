<script setup lang="ts">
type LearningMaterial = {
  id: string;
  title: string;
  content: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const route = useRoute();
const materialId = route.params.id as string;

const {
  data: material,
  pending,
  error,
} = useAsyncData<LearningMaterial>("learning-material", async () => {
  const response = await $fetch(`/api/learning-materials/${materialId}`);
  return response.data;
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-4xl px-4 py-8">
      <!-- Loading State -->
      <div
        v-if="pending"
        class="flex flex-col items-center justify-center space-y-4 py-12"
      >
        <UIcon
          name="i-heroicons-book-open-20-solid"
          class="text-primary-500 h-12 w-12 animate-pulse"
        />
        <span class="text-gray-500">Memuat materi...</span>
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle-20-solid"
        color="red"
        variant="solid"
        :title="error.message"
        class="mb-6"
      />

      <!-- Content -->
      <div v-else class="space-y-8">
        <!-- Header Section -->
        <div class="space-y-4">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ material.title }}
          </h1>

          <div class="flex items-center gap-2">
            <UBadge color="gray" variant="subtle">
              <UIcon name="i-heroicons-calendar-20-solid" class="h-4 w-4" />
              {{ formatDate(material.createdAt) }}
            </UBadge>
          </div>
        </div>

        <!-- Content Body -->
        <div class="border bg-white p-6 shadow-sm">
          <article class="prose max-w-none">
            <div v-html="material.content" />
          </article>

          <!-- Document Attachment -->
          <div v-if="material.documentUrl" class="mt-8">
            <UButton
              :to="material.documentUrl"
              target="_blank"
              variant="outline"
              color="primary"
              icon="i-heroicons-document-arrow-down-20-solid"
              label="Download dokumen"
              trailing
              class="w-full sm:w-auto"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between">
          <UButton
            to="/materi"
            variant="outline"
            color="gray"
            icon="i-heroicons-arrow-left-20-solid"
            label="Kembali ke Daftar Materi"
            class="justify-center"
          />

          <UButton
            :to="`/quiz/${materialId}`"
            variant="solid"
            color="primary"
            icon="i-heroicons-academic-cap-20-solid"
            label="Mulai Quiz"
            trailing
            class="justify-center"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.prose {
  font-size: 1rem;
  line-height: 1.6;
}

.prose img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.prose blockquote {
  border-left: 4px solid #3b82f6;
  background-color: #f8fafc;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}

.prose h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.5rem;
}

.prose h3 {
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
}
</style>
