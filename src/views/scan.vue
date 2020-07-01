<template>

   <section class="scan">

       <logo-component></logo-component>

       <qrcode-stream @decode="onDecode"></qrcode-stream>

       <h2>Escaneie o codigo QR</h2>

       <p>Aponte a câmera do seu smartphone para o código QR da sua mesa para acessar o menu.</p>
       <p>Ou use um app para escaneamento de codigos QR.</p>



   </section>

</template>

<script>

    import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader';

    import LogoComponent from "../components/LogoComponent";


    export default {
        name: "scan",

        components: {
            LogoComponent,
            QrcodeStream,
            QrcodeDropZone,
            QrcodeCapture
        },


        methods: {

            onDecode (decodedString) {

                window.location.href = decodedString

            }


        }


    }
</script>

<style lang="scss">

    .scan{

        text-align: center;

        padding: 20px;

        display: flex;

        flex-direction: column;

        .logo{

            display: flex;

            align-items: center;

            margin-bottom: 50px;

            img{ width: 40px; height: 40px; margin-right: 10px}

        }

        h2{

            margin-top: 50px;

        }
    }

    .wrapper{

        padding: 0 !important;

        max-height: 280px;

        height: 280px;

    }

    .inside {

        max-height: 280px !important;

        height: 280px !important;

        &:after{

            position: absolute;

            top:7%; left: 7%;

            z-index: 100;

            content: "";

            width: 86%;

            height: 86%;

            border: 4px solid var(--color-primary);

            opacity: 0.7;

        }

    }

</style>