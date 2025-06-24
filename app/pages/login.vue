<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const config = useRuntimeConfig().public;
const toast = useToast();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  try {
    isLoading.value = true;
    const email = `${username.value}@${config.appDomain}`;

    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password: password.value,
    });

    if (error) throw error;

    const userRole = authUser!.app_metadata?.role;
    await navigateTo(userRole === "admin" ? "/admin" : "/");
  } catch (error: any) {
    let errorMessage = "Terjadi kesalahan saat login";

    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Username atau Password salah";
    }

    toast.add({
      title: "Login Gagal",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    isLoading.value = false;
    username.value = "";
    password.value = "";
  }
};

if (user.value) {
  const role = user.value?.app_metadata?.role;
  navigateTo(role === "admin" ? "/admin" : "/");
}
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="flex items-center justify-center">
        <UCard class="w-full">
          <template #header>
            <div class="text-center">
              <h1 class="text-xl font-semibold">Halo, Selamat Datang</h1>
              <p class="text-sm">Silahkan masuk terlebih dahulu menggunakan akunmu</p>
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

            <UFormField label="Kata Sandi" size="lg">
              <UInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan kata sandi"
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
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>

            <UButton
              block
              size="lg"
              :disabled="!username || !password"
              :loading="isLoading"
              @click="handleLogin"
              >Masuk</UButton
            >
          </div>
        </UCard>
      </div>
    </NuxtLayout>
  </div>
</template>
