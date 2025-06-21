<template>
  <div>
    <NuxtLayout>
      <div>
        <h1 class="mb-6 text-center text-2xl font-bold">Profil Pengembang</h1>

        <!-- Card Pengembang -->
        <UCard class="mb-6 shadow-lg">
          <div class="text-center">
            <h2 class="mb-3 text-lg font-semibold text-gray-800">
              Pengembang E-Learning
            </h2>
            <div
              class="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-slate-300"
            >
              <img
                src="~/assets/imgs/profile-picture-alya.png"
                alt="Alya Nabila"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="space-y-3 text-left">
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-user-circle"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p><span class="font-medium">Nama:</span> Alya Nabila</p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p><span class="font-medium">NIM:</span> 23011140006</p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-book-open"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p>
                  <span class="font-medium">Prodi:</span> S2 Teknologi
                  Pembelajaran
                </p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-building-library"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p>
                  <span class="font-medium">Universitas:</span> Universitas
                  Negeri Yogyakarta (UNY)
                </p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-envelope"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p>
                  <span class="font-medium">Email:</span>
                  alyanabila.2023@student.uny.ac.id
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Card Dosen Pembimbing -->
        <UCard class="mb-6 shadow-lg">
          <div class="text-center">
            <h2 class="mb-3 text-lg font-semibold text-gray-800">
              Dosen Pembimbing
            </h2>
            <div
              class="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-slate-300"
            >
              <img
                src="~/assets/imgs/profile-picture-herman.jpg"
                alt="Prof. Herman Dwi Surjono"
                class="h-full w-full object-cover object-top"
              />
            </div>
            <div class="space-y-3 text-left">
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-user-circle"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p>
                  <span class="font-medium">Nama:</span> Prof. Herman Dwi
                  Surjono, M.Sc., M.T., Ph.D.
                </p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-identification"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p><span class="font-medium">NIP:</span> 196402051987031001</p>
              </div>
              <div class="flex items-start">
                <UIcon
                  name="i-heroicons-envelope"
                  class="mt-1 mr-2 flex-shrink-0 text-sky-500"
                />
                <p>
                  <span class="font-medium">Email:</span>
                  hermansurjono@uny.ac.id
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Additional Info -->
        <div class="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <h3 class="mb-3 text-lg font-semibold text-sky-700">
            Tentang Aplikasi
          </h3>
          <p class="text-gray-700">
            Aplikasi e-learning ini dikembangkan sebagai bagian dari penelitian
            tesis di Program Studi Teknologi Pembelajaran, Universitas Negeri
            Yogyakarta. Aplikasi ini bertujuan untuk memberikan pengalaman
            belajar yang interaktif dan menarik bagi peserta didik.
          </p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
