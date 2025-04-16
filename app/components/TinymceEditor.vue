<script setup lang="ts">
import Editor from "@tinymce/tinymce-vue";
import type { Editor as TinyMCEEditor } from "tinymce";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);
const tinymceKey = useRuntimeConfig().public.tinymceKey;

const initOptions = {
  height: 500,
  menubar: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "print",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "paste",
    "code",
    "help",
    "wordcount",
    "imagetools",
  ],
  toolbar:
    "undo redo | bold italic | \
        alignleft aligncenter alignright alignjustify | \
        bullist numlist outdent indent | image link charmap",
  paste_data_images: true,
  content_style: "img {max-width: 100%; height: auto;}",
  convert_urls: false,
  images_upload_handler: (blobInfo, progress) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blobInfo.blob());
    }),
  setup: (editor: TinyMCEEditor) => {
    editor.on("init", () => {
      editor.setContent(props.modelValue);
    });

    editor.on("change", () => {
      emit("update:modelValue", editor.getContent());
    });
  },
};
</script>

<template>
  <ClientOnly fallbackTag="span">
    <Editor :api-key="tinymceKey" :init="initOptions" />
  </ClientOnly>
</template>
