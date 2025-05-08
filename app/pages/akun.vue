<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();

// Password Update
const isPasswordFormOpen = ref(false);
const newPassword = ref("");
const confirmNewPassword = ref("");

// Password visibility toggles
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const isFormValid = computed(() => {
  return (
    newPassword.value &&
    confirmNewPassword.value &&
    newPassword.value === confirmNewPassword.value
  );
});

// Handle Password Update
const handlePasswordUpdate = async () => {
  if (!isFormValid.value) return;

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
      // password_confirmation: confirmNewPassword.value,
    });

    if (error) throw error;

    toast.add({
      title: "Sukses",
      description: "Password berhasil diubah!",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });
    resetForm();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

const resetForm = () => {
  newPassword.value = "";
  confirmNewPassword.value = "";
  isPasswordFormOpen.value = false;
};

// Handle Logout
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.add({
      title: "Gagal logout",
      description: error.message,
      color: "error",
    });
    return;
  }
  navigateTo("/login");
};

// Full Name
const fullName = computed(
  () => user.value?.user_metadata?.full_name || "Pengguna",
);
</script>

<template>
  <NuxtLayout>
    <div class="bg-gray-50 p-4">
      <!-- Profile Header -->
      <div class="my-8 flex flex-col items-center space-y-4">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ fullName }}
        </h1>
      </div>

      <!-- Action Cards -->
      <div class="space-y-4">
        <!-- Ubah Password -->
        <UCard
          class="cursor-pointer transition-all hover:bg-gray-50 hover:shadow-md hover:ring-1 hover:ring-gray-200"
          @click="isPasswordFormOpen = !isPasswordFormOpen"
        >
          <div class="flex items-center gap-3 p-4">
            <UIcon
              name="i-heroicons-lock-closed"
              class="text-primary-600 h-6 w-6"
            />
            <span class="text-gray-700">Ubah Password</span>
          </div>

          <transition name="slide-fade">
            <div
              v-if="isPasswordFormOpen"
              class="border-t border-gray-200 bg-gray-50 p-4"
              @click.stop
            >
              <!-- New Password -->
              <UFormField label="Password Baru" size="lg">
                <UInput
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Masukkan password baru"
                  class="mb-4 w-full"
                  icon="i-heroicons-lock-closed-20-solid"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="xs"
                      :icon="
                        showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                      "
                      @click="showNewPassword = !showNewPassword"
                    />
                  </template>
                </UInput>
              </UFormField>

              <!-- Confirm Password -->
              <UFormField label="Konfirmasi Password" size="lg">
                <UInput
                  v-model="confirmNewPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Konfirmasi password"
                  class="mb-4 w-full"
                  icon="i-heroicons-lock-closed-20-solid"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="xs"
                      :icon="
                        showConfirmPassword
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      @click="showConfirmPassword = !showConfirmPassword"
                    />
                  </template>
                </UInput>
              </UFormField>

              <div class="flex justify-end">
                <UButton
                  variant="solid"
                  color="primary"
                  :disabled="!isFormValid"
                  @click="handlePasswordUpdate"
                >
                  Perbarui Password
                </UButton>
              </div>
            </div>
          </transition>
        </UCard>

        <!-- Logout -->
        <UCard
          class="cursor-pointer transition-all hover:bg-red-100 hover:shadow-md hover:ring-1 hover:ring-red-200"
          @click="handleLogout"
        >
          <div class="flex items-center gap-3 p-4">
            <UIcon
              name="i-heroicons-arrow-left-on-rectangle"
              class="h-6 w-6 text-red-600"
            />
            <span class="text-gray-700">Logout</span>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
