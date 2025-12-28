export default defineConfig(({command, mode, isSsrBuild, isPreview}) => {
    if (command === 'gh') {
        return {
            base: 'https://shaobin-jiang.github.io/pq-report/'
        }
    }
})
