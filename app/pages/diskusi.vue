<script setup lang="ts">
const supabaseUser = useSupabaseUser();
const toast = useToast();

// User state
const currentUser = ref({
  id: supabaseUser.value?.id,
  fullname: supabaseUser.value?.user_metadata?.full_name,
  avatar: supabaseUser.value?.user_metadata?.avatar_url,
});

// Discussions state
const discussions = ref<any[]>([]);
const newPostContent = ref("");
const newComments = ref<Record<string, string>>({});
const isLoading = ref(false);
const isPosting = ref(false);

// Format time
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const formatter = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return formatter.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return formatter.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  return formatter.format(-days, "day");
};

// Fetch discussions
const fetchDiscussions = async () => {
  try {
    isLoading.value = true;
    const { data } = await $fetch("/api/discussions");
    discussions.value = data.map((d: any) => ({
      ...d,
      isEditing: false,
      editContent: "",
      comments: d.comments.map((c: any) => ({
        ...c,
        isEditing: false,
        editContent: "",
      })),
    }));
  } catch (error: any) {
    toast.add({
      title: "Gagal!",
      description: "Gagal memuat diskusi",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

// Create discussion
const createDiscussion = async () => {
  try {
    isPosting.value = true;
    const { data: newDiscussion } = await $fetch("/api/discussions", {
      method: "POST",
      body: { content: newPostContent.value },
    });

    discussions.value = [newDiscussion, ...discussions.value];
    newPostContent.value = "";

    toast.add({
      title: "Sukses",
      description: "Diskusi berhasil dibuat",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    isPosting.value = false;
    await fetchDiscussions();
  }
};

// Start editing discussion
const startEditingDiscussion = (discussion: any) => {
  discussion.isEditing = true;
  discussion.editContent = discussion.content;
};

// Update discussion
const updateDiscussion = async (discussion: any) => {
  try {
    const updatedContent = discussion.editContent.trim();
    if (!updatedContent) {
      toast.add({
        title: "Error",
        description: "Konten tidak boleh kosong",
        color: "error",
        icon: "i-heroicons-exclamation-circle-20-solid",
      });
      return;
    }

    await $fetch(`/api/discussions/${discussion.id}`, {
      method: "PUT",
      body: { content: updatedContent },
    });

    discussion.content = updatedContent;
    discussion.isEditing = false;
    discussion.editContent = "";

    toast.add({
      title: "Sukses",
      description: "Diskusi berhasil diperbarui",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    await fetchDiscussions();
  }
};

// Cancel edit discussion
const cancelEditDiscussion = (discussion: any) => {
  discussion.isEditing = false;
  discussion.editContent = "";
};

// Delete discussion
const deleteDiscussion = async (id: string) => {
  try {
    await $fetch(`/api/discussions/${id}`, { method: "DELETE" });
    discussions.value = discussions.value.filter((d) => d.id !== id);

    toast.add({
      title: "Sukses",
      description: "Diskusi berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    await fetchDiscussions();
  }
};

// Create comment
const createComment = async (discussionId: string) => {
  const content = newComments.value[discussionId]?.trim();
  if (!content) return;
  try {
    const { data } = await $fetch("/api/comments", {
      method: "POST",
      body: { content, discussionId },
    });
    const discussion = discussions.value.find((d) => d.id === discussionId);
    if (discussion) {
      discussion.comments.push(data);
      newComments.value[discussionId] = "";
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error?.data?.message || "Failed to create comment",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    await fetchDiscussions();
  }
};

// Start editing comment
const startEditingComment = (comment: any) => {
  comment.isEditing = true;
  comment.editContent = comment.content;
};

// Update comment
const updateComment = async (comment: any) => {
  try {
    const updatedContent = comment.editContent.trim();
    if (!updatedContent) {
      toast.add({
        title: "Peringatan!",
        description: "Komentar tidak boleh kosong",
        color: "warning",
      });
      return;
    }

    await $fetch(`/api/comments/${comment.id}`, {
      method: "PUT",
      body: { content: updatedContent },
    });

    comment.content = updatedContent;
    comment.isEditing = false;
    comment.editContent = "";

    toast.add({
      title: "Berhasil!",
      description: "Komentar berhasil diperbarui",
      color: "success",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    await fetchDiscussions();
  }
};

// Cancel edit comment
const cancelEditComment = (comment: any) => {
  comment.isEditing = false;
  comment.editContent = "";
};

// Delete comment
const deleteComment = async (commentId: string) => {
  try {
    await $fetch(`/api/comments/${commentId}`, { method: "DELETE" });

    toast.add({
      title: "Sukses",
      description: "Komentar berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    await fetchDiscussions();
  }
};

onMounted(fetchDiscussions);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="space-y-4">
        <!-- Create Post -->
        <UCard class="rounded-xl shadow">
          <div class="flex gap-3">
            <UAvatar
              :src="currentUser?.avatar"
              :alt="currentUser?.fullname"
              size="md"
              class="flex-shrink-0"
            />
            <UTextarea
              v-model="newPostContent"
              placeholder="Apa yang kamu pikirkan?"
              :rows="2"
              autoresize
              class="w-full"
              :ui="{ base: 'resize-none border-0 focus:ring-0' }"
            />
          </div>
          <div class="mt-3 flex justify-end border-t border-t-[#D4D4D4] pt-3">
            <UButton
              label="Posting"
              color="primary"
              :loading="isPosting"
              :disabled="!newPostContent"
              class="px-6 font-medium"
              @click="createDiscussion"
            />
          </div>
        </UCard>

        <!-- Posts -->
        <div class="space-y-4">
          <UCard
            v-for="discussion in discussions"
            :key="discussion.id"
            class="rounded-xl shadow"
          >
            <!-- Post Header -->
            <div class="mb-4 flex items-center gap-3">
              <UAvatar
                :src="discussion.author?.avatar"
                :alt="discussion.author?.fullname"
                size="md"
              />
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ discussion.author?.fullname }}
                </h3>
                <p class="text-xs text-gray-500">
                  {{ formatTimeAgo(discussion.createdAt) }}
                </p>
              </div>
              <div
                v-if="discussion.authorId === currentUser?.id"
                class="ml-auto"
              >
                <UButton
                  v-if="!discussion.isEditing"
                  icon="i-heroicons-trash-20-solid"
                  color="neutral"
                  variant="ghost"
                  @click="deleteDiscussion(discussion.id)"
                />
                <UButton
                  v-if="!discussion.isEditing"
                  icon="i-heroicons-pencil-square"
                  color="neutral"
                  variant="ghost"
                  class="ml-2"
                  @click="startEditingDiscussion(discussion)"
                />
              </div>
            </div>

            <!-- Post Content -->
            <div v-if="discussion.isEditing">
              <div class="flex gap-3">
                <UTextarea
                  v-model="discussion.editContent"
                  placeholder="Edit postingan..."
                  autoresize
                  class="w-full"
                  :ui="{ base: 'resize-none border-0 focus:ring-0' }"
                />
              </div>
              <div class="mt-3 flex justify-end">
                <UButton
                  label="Update"
                  color="primary"
                  @click="updateDiscussion(discussion)"
                />
                <UButton
                  label="Batal"
                  color="neutral"
                  variant="ghost"
                  class="ml-2"
                  @click="cancelEditDiscussion(discussion)"
                />
              </div>
            </div>
            <div v-else>
              <p
                class="mb-4 whitespace-pre-wrap text-gray-900 dark:text-gray-100"
              >
                {{ discussion.content }}
              </p>
            </div>

            <!-- Comments -->
            <div class="mt-4 space-y-4">
              <div
                v-for="comment in discussion.comments"
                :key="comment.id"
                class="ml-4 flex gap-3 border-l-2 border-gray-200 pl-4 dark:border-gray-700"
              >
                <UAvatar
                  :src="comment.author?.avatar"
                  :alt="comment.author?.fullname"
                  size="sm"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {{ comment.author?.fullname }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ formatTimeAgo(comment.createdAt) }}
                    </span>
                    <div
                      v-if="comment.authorId === currentUser?.id"
                      class="ml-auto"
                    >
                      <UButton
                        icon="i-heroicons-trash-20-solid"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        @click="deleteComment(comment.id)"
                      />
                      <UButton
                        v-if="!comment.isEditing"
                        icon="i-heroicons-pencil-square"
                        color="neutral"
                        variant="ghost"
                        size="xs"
                        class="ml-2"
                        @click="startEditingComment(comment)"
                      />
                    </div>
                  </div>

                  <!-- Comment Content -->
                  <div v-if="!comment.isEditing">
                    <p class="mt-1 text-sm text-gray-800 dark:text-gray-200">
                      {{ comment.content }}
                    </p>
                  </div>
                  <div v-else>
                    <div class="flex gap-3">
                      <UTextarea
                        v-model="comment.editContent"
                        placeholder="Edit komentar..."
                        autoresize
                        class="w-full"
                        :ui="{ base: 'resize-none border-0 focus:ring-0' }"
                      />
                    </div>
                    <div class="mt-3 flex justify-end">
                      <UButton
                        label="Update"
                        color="primary"
                        @click="updateComment(comment)"
                      />
                      <UButton
                        label="Batal"
                        color="neutral"
                        variant="ghost"
                        class="ml-2"
                        @click="cancelEditComment(comment)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Comment Input -->
              <div class="mt-4 flex justify-between">
                <UAvatar
                  :src="currentUser?.avatar"
                  :alt="currentUser?.fullname"
                  size="sm"
                  class="flex-shrink-0"
                />
                <UInput
                  v-model="newComments[discussion.id]"
                  placeholder="Tulis komentar..."
                  size="sm"
                  class="w-full rounded-full px-4"
                  @keyup.enter.prevent
                />
                <UButton
                  color="primary"
                  variant="solid"
                  icon="i-heroicons-paper-airplane-20-solid"
                  :disabled="!newComments[discussion.id]?.trim()"
                  class="rounded-full"
                  @click="createComment(discussion.id)"
                />
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
