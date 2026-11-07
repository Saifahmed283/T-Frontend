// Google Tag Manager — GTM-WPPBWZ2K
export default function headHtmlBegin() {
  return `
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-WPPBWZ2K"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
  `.trim()
}