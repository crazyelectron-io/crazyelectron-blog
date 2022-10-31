<template>
  <div class="mb-16 items-center">
    <div class="max-w-lg mx-auto">
      <div class="flex justify-center mb-6">
        <div>
          <AppSearchInput />
        </div>
        <div>
          <img
            src="/welcome/content-light.png"
            alt="welcome image"
            height="100"
            class="light-img w-full"
          />
          <img
            src="/welcome/content-dark.png"
            alt="welcome image"
            class="dark-img w-full"
          />
        </div>
        <div>
          <img
            src="/welcome/nuxt-light.png"
            alt="welcome image"
            class="light-img w-full"
          />
          <img
            src="/welcome/nuxt-dark.png"
            alt="welcome image"
            class="dark-img w-full"
          />
        </div>
      </div>
      <div class="xl:text-lg font-medium leading-relaxed text-center">
        <p>
          This is a simple (work in progress) blog where I keep track of my projects and findings. There just might be some usefull stuff in there for you as well.
        </p>
      </div>
    </div>
  </div>
</template>
