<script setup lang="ts">
const username = ref("");
const password = ref("");
const showPassword = ref(false);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="flex items-center justify-center">
        <UCard class="w-full">
          <template #header>
            <div class="text-center">
              <h1 class="text-xl font-semibold">Halo, Selamat Datang</h1>
              <p class="text-sm">Silahkan login terlebih dahulu</p>
            </div>
          </template>

          <div class="space-y-6">
            <UFormField label="Username" size="lg">
              <UInput
                v-model="username"
                type="text"
                placeholder="Masukkan username"
                icon="i-heroicons-user-20-solid"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Password" size="lg">
              <UInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                icon="i-heroicons-lock-closed-20-solid"
                :ui="{ trailing: 'pe-1' }"
                class="w-full"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <UButton
              block
              size="lg"
              :disabled="!username || !password"
              class="cursor-pointer disabled:bg-neutral-400"
              >Login</UButton
            >
          </div>
        </UCard>
      </div>
    </NuxtLayout>
  </div>
</template>
