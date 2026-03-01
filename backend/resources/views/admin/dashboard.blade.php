<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sensory Composer — Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen">

<nav class="bg-gray-900 border-b border-white/10 px-6 py-3 flex items-center justify-between">
    <span class="text-lg font-semibold text-indigo-400">Sensory Composer Admin</span>
    <span class="text-xs text-gray-500">Laravel {{ app()->version() }}</span>
</nav>

<div class="max-w-5xl mx-auto px-6 py-10" x-data="dashboard()">
    <h1 class="text-3xl font-bold mb-1">Dashboard</h1>
    <p class="text-gray-400 text-sm mb-8">All saved score packages are listed below.</p>

    <div class="grid grid-cols-3 gap-4 mb-10">
        <div class="bg-gray-900 rounded-xl p-5 border border-white/10">
            <p class="text-xs text-gray-500 mb-1">Total Scores</p>
            <p class="text-3xl font-bold text-indigo-400" x-text="scores.length">—</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-5 border border-white/10">
            <p class="text-xs text-gray-500 mb-1">With Audio</p>
            <p class="text-3xl font-bold text-pink-400" x-text="scores.filter(s => s.audio_base64).length">—</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-5 border border-white/10">
            <p class="text-xs text-gray-500 mb-1">With Poem</p>
            <p class="text-3xl font-bold text-green-400" x-text="scores.filter(s => s.poem).length">—</p>
        </div>
    </div>

    <div class="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
        <table class="w-full text-sm">
            <thead class="bg-gray-800 text-gray-400 text-xs uppercase">
                <tr>
                    <th class="px-4 py-3 text-left">Title</th>
                    <th class="px-4 py-3 text-left">Captured At</th>
                    <th class="px-4 py-3 text-left">Poem Words</th>
                    <th class="px-4 py-3 text-left">Actions</th>
                </tr>
            </thead>
            <tbody>
                <template x-if="scores.length === 0">
                    <tr>
                        <td colspan="4" class="px-4 py-8 text-center text-gray-600">No scores yet.</td>
                    </tr>
                </template>
                <template x-for="score in scores" :key="score.id">
                    <tr class="border-t border-white/5 hover:bg-gray-800/50 transition-colors">
                        <td class="px-4 py-3 font-medium" x-text="score.title"></td>
                        <td class="px-4 py-3 text-gray-400 text-xs" x-text="score.created_at"></td>
                        <td class="px-4 py-3 text-gray-400" x-text="score.poem ? score.poem.trim().split(/\s+/).length : 0"></td>
                        <td class="px-4 py-3">
                            <button
                                @click="deleteScore(score.id)"
                                class="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >Delete</button>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>

    <p class="text-xs text-gray-700 mt-4" x-show="error" x-text="error"></p>
</div>

<script>
function dashboard() {
    return {
        scores: [],
        error: '',
        async init() {
            try {
                const res = await fetch('/api/v1/scores');
                if (!res.ok) throw new Error('Failed to load scores');
                this.scores = await res.json();
            } catch (e) {
                this.error = e.message;
            }
        },
        async deleteScore(id) {
            if (!confirm('Delete this score?')) return;
            try {
                await fetch(`/api/v1/scores/${id}`, { method: 'DELETE' });
                this.scores = this.scores.filter(s => s.id !== id);
            } catch (e) {
                this.error = 'Delete failed: ' + e.message;
            }
        },
    };
}
</script>
</body>
</html>
