<script setup lang="ts">
const items = [
  "https://picsum.photos/640/640?random=1",
  "https://picsum.photos/640/640?random=2",
  "https://picsum.photos/640/640?random=3",
  "https://picsum.photos/640/640?random=4",
  "https://picsum.photos/640/640?random=5",
  "https://picsum.photos/640/640?random=6",
];
</script>

<template>
  <div>
    <NuxtLayout>
      <div>
        <div class="relative overflow-hidden rounded-lg aspect-[5/4.5]">
          <UCarousel
            v-slot="{ item }"
            arrows
            :autoplay="{ delay: 4000 }"
            :items="items"
            :ui="{
              root: 'w-full',
              prev: 'absolute left-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900/75 text-white rounded-full p-1',
              next: 'absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900/50 hover:bg-gray-900/75 text-white rounded-full p-1',
            }"
            :prev="{
              color: 'neutral',
              variant: 'ghost',
              size: 'xs',
            }"
            :next="{
              color: 'neutral',
              variant: 'ghost',
              size: 'xs',
            }"
          >
            <img :src="item" class="h-full w-full object-cover" />
          </UCarousel>
        </div>

        <div class="mt-6 flex justify-around">
          <NuxtLink
            to="/panduan-penggunaan"
            class="flex size-[94px] cursor-pointer items-center justify-center rounded-xl bg-(--ui-primary) p-2 text-center text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Panduan<br />Penggunaan
          </NuxtLink>

          <NuxtLink
            to="capaian-pembelajaran"
            class="flex size-[94px] cursor-pointer items-center justify-center rounded-xl bg-(--ui-primary) p-2 text-center text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Capaian<br />Pembelajaran
          </NuxtLink>

          <NuxtLink
            to="profil-pengembang"
            class="flex size-[94px] cursor-pointer items-center justify-center rounded-xl bg-(--ui-primary) p-2 text-center text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Profil<br />Pengembang
          </NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
