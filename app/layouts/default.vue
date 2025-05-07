<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-(--ui-primary)">
      <div
        class="mx-auto flex h-[60px] w-full max-w-[480px] items-center gap-4 px-4"
      >
        <slot name="header">
          <img
            src="~/assets/icons/logo-dinda.png"
            alt="Logo DINDA"
            class="h-12"
          />
        </slot>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto grid w-full max-w-[480px] flex-1 bg-white p-4">
      <slot />
    </main>

    <!-- Navigation Bar -->
    <Navbar />
  </div>
</template>
