<template>
  <div class="flex min-h-screen flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-(--ui-primary)">
      <div
        class="mx-auto flex h-[60px] w-full max-w-[480px] items-center gap-4 px-4"
      >
        <slot name="header">
          <h1 class="text-2xl font-bold text-(--ui-bg)">DINDA</h1>
        </slot>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto grid w-full max-w-[480px] flex-1 bg-white p-4">
      <slot />
    </main>

    <!-- Navigation Bar -->
    <nav class="sticky bottom-0 z-10">
      <ul
        class="mx-auto flex h-[65px] w-full max-w-[480px] items-center justify-around border-t border-(--ui-border-accented) bg-white"
      >
        <li>Menu 1</li>
        <li>Menu 2</li>
        <li>Menu 3</li>
        <li>Menu 4</li>
        <li>Menu 5</li>
      </ul>
    </nav>
  </div>
</template>
