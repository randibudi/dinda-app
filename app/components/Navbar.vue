<script setup lang="ts">
const user = useSupabaseUser();

const isAdmin = computed(() => {
  return user.value?.app_metadata?.role === "admin";
});
</script>

<template>
  <nav class="sticky bottom-0 z-10">
    <ul
      class="mx-auto flex h-[65px] w-full max-w-[480px] items-center justify-around border-t border-(--ui-border-accented) bg-white"
    >
      <!-- Admin View -->
      <template v-if="isAdmin">
        <li>
          <ULink to="/admin/siswa">Siswa</ULink>
        </li>
        <li>
          <ULink to="/admin/materi">Materi</ULink>
        </li>
        <li>
          <ULink to="/admin/quiz">Quiz</ULink>
        </li>
        <li>
          <ULink to="/diskusi">Diskusi</ULink>
        </li>
      </template>

      <!-- User View -->
      <template v-else>
        <li>
          <ULink to="/">Beranda</ULink>
        </li>
        <li>
          <ULink to="/diskusi">Diskusi</ULink>
        </li>
      </template>
    </ul>
  </nav>
</template>
