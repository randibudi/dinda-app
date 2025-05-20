<script setup lang="ts">
const user = useSupabaseUser();

const isAdmin = computed(() => {
  return user.value?.app_metadata?.role === "admin";
});

const adminLinks = [
  { path: "/admin/siswa", label: "Siswa", icon: "i-heroicons-user-group" },
  { path: "/admin/materi", label: "Materi", icon: "i-heroicons-book-open" },
  {
    path: "/admin/quiz",
    label: "Quiz",
    icon: "i-heroicons-question-mark-circle",
  },
  {
    path: "/diskusi",
    label: "Diskusi",
    icon: "i-heroicons-chat-bubble-left-ellipsis",
  },
  { path: "/admin/tugas", label: "Tugas", icon: "i-heroicons-document-text" },
  { path: "/akun", label: "Akun", icon: "i-heroicons-user-circle" },
];

const userLinks = [
  { path: "/", label: "Beranda", icon: "i-heroicons-home" },
  { path: "/materi", label: "Materi", icon: "i-heroicons-book-open" },
  {
    path: "/diskusi",
    label: "Diskusi",
    icon: "i-heroicons-chat-bubble-left-ellipsis",
  },
  { path: "/tugas", label: "Tugas", icon: "i-heroicons-document-text" },
  { path: "/akun", label: "Akun", icon: "i-heroicons-user-circle" },
];
</script>

<template>
  <nav class="sticky bottom-0 z-10">
    <ul
      class="mx-auto flex h-[72px] w-full max-w-[480px] items-center justify-around border-t border-(--ui-border-accented) bg-white px-2"
    >
      <!-- Admin View -->
      <template v-if="isAdmin">
        <li v-for="link in adminLinks" :key="link.path" class="flex-1">
          <ULink
            :to="link.path"
            class="hover:text-primary-500 flex flex-col items-center justify-center gap-1 px-2 py-1.5 text-gray-600 transition-colors"
            active-class="text-primary-500"
          >
            <UIcon :name="link.icon" class="h-6 w-6" />
            <span class="text-xs font-medium">{{ link.label }}</span>
          </ULink>
        </li>
      </template>

      <!-- User View -->
      <template v-else>
        <li v-for="link in userLinks" :key="link.path" class="flex-1">
          <ULink
            :to="link.path"
            class="hover:text-primary-500 flex flex-col items-center justify-center gap-1 px-2 py-1.5 text-gray-600 transition-colors"
            active-class="text-primary-500"
          >
            <UIcon :name="link.icon" class="h-6 w-6" />
            <span class="text-xs font-medium">{{ link.label }}</span>
          </ULink>
        </li>
      </template>
    </ul>
  </nav>
</template>
