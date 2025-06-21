<template>
  <div>
    <NuxtLayout>
      <div>
        <h1 class="mb-6 text-center text-2xl font-bold">
          Capaian Pembelajaran
        </h1>

        <!-- Card Elemen Menyimak -->
        <UCard class="mb-6 shadow-lg">
          <div class="flex items-start">
            <UIcon
              name="material-symbols:hearing-rounded"
              class="mt-1 mr-3 flex-shrink-0 text-xl text-sky-500"
            />
            <div>
              <h2 class="mb-2 text-lg font-semibold text-gray-800">
                Elemen Menyimak
              </h2>
              <p class="text-gray-700">
                Peserta didik mampu memahami dan memaknai ide (pokok dan
                pendukung) dari teks (fiksi dan nonfiksi) melalui media audio,
                audiovisual, teks aural (teks yang dibacakan dan/atau didengar),
                dan instruksi lisan berbahasa Sunda.
              </p>
            </div>
          </div>
        </UCard>

        <!-- Card Elemen Berbicara -->
        <UCard class="mb-6 shadow-lg">
          <div class="mb-3 flex items-start">
            <UIcon
              name="ri:speak-line"
              class="mt-1 mr-3 flex-shrink-0 text-xl text-sky-500"
            />
            <h2 class="text-lg font-semibold text-gray-800">
              Elemen Berbicara
            </h2>
          </div>

          <div class="space-y-4">
            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">1</span>
              </div>
              <p class="text-gray-700">
                Peserta didik mampu berbicara berbahasa Sunda dengan pilihan
                kata dan sikap tubuh (gestur) yang santun, serta menggunakan
                volume dan intonasi yang tepat sesuai konteks sesuai kaidah
                bahasa dan norma budaya Sunda.
              </p>
            </div>

            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">2</span>
              </div>
              <p class="text-gray-700">
                Peserta didik mampu mengajukan dan menanggapi pertanyaan
                berbahasa Sunda dalam suatu percakapan atau diskusi dengan aktif
                sesuai kaidah bahasa dan norma budaya Sunda.
              </p>
            </div>

            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">2</span>
              </div>
              <p class="text-gray-700">
                Peserta didik mampu mengungkapkan gagasan dalam suatu percakapan
                atau diskusi berbahasa Sunda kaidah bahasa dan norma budaya
                Sunda.
              </p>
            </div>

            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">2</span>
              </div>
              <p class="text-gray-700">
                Peserta didik mampu menceritakan kembali dalam bahasa Sunda
                suatu informasi yang dibaca atau didengar dari tipe teks (fiksi
                dan nonfiksi) sederhana dengan beragam topik.
              </p>
            </div>
          </div>
        </UCard>

        <!-- Tujuan Pembelajaran -->
        <h1 class="mb-4 text-center text-2xl font-bold">Tujuan Pembelajaran</h1>

        <!-- Card Tujuan Pembelajaran -->
        <UCard class="mb-6 shadow-lg">
          <div class="space-y-4">
            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">1</span>
              </div>
              <p class="text-gray-700">
                Menyebutkan permasalahan yang dialami tokoh di dalam cerita.
              </p>
            </div>

            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">2</span>
              </div>
              <p class="text-gray-700">
                Menulis dengan struktur awal-tengah-akhir menggunakan kaidah
                bahasa yang baik dan benar menggunakan bahasa Sunda.
              </p>
            </div>

            <div class="flex items-start">
              <div
                class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100"
              >
                <span class="font-bold text-sky-700">3</span>
              </div>
              <p class="text-gray-700">
                Menggunakan kata-kata berkenaan dengan sikap sopan santun (undak
                usuk basa).
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </NuxtLayout>
  </div>
</template>
