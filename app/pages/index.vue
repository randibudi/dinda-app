<script setup lang="ts">
import gambar1 from '~/assets/imgs/1.png';
import gambar2 from '~/assets/imgs/2.png';
import gambar3 from '~/assets/imgs/3.png';
const items = [
  gambar1,
  gambar2,
  gambar3, 
];
</script>

<template>
  <div>
    <NuxtLayout>
      <div>
        <div class="relative overflow-hidden rounded-lg aspect-[X/Y]">
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
            to="/petunjuk-penggunaan"
            class="flex size-[94px] cursor-pointer items-center justify-center rounded-xl bg-(--ui-primary) p-2 text-center text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Petunjuk<br />Penggunaan
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
