
module.exports=(url,name)=>{
    return "<!DOCTYPE html>\n" +
        "<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n" +
        "<head>\n" +
        "    <meta charset=\"utf-8\">\n" +
        "    <meta name=\"viewport\" content=\"width=device-width\">\n" +
        "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n" +
        "    <meta name=\"x-apple-disable-message-reformatting\">\n" +
        "    <title></title>\n" +
        "    <link href=\"https://fonts.googleapis.com/css?family=Lato:300,400,700\" rel=\"stylesheet\">\n" +
        "\n" +
        "    <style>\n" +
        "        html,\n" +
        "        body {\n" +
        "            margin: 0 auto !important;\n" +
        "            padding: 0 !important;\n" +
        "            height: 100% !important;\n" +
        "            width: 100% !important;\n" +
        "            background: #f1f1f1;\n" +
        "        }\n" +
        "        * {\n" +
        "            -ms-text-size-adjust: 100%;\n" +
        "            -webkit-text-size-adjust: 100%;\n" +
        "        }\n" +
        "        div[style*=\"margin: 16px 0\"] {\n" +
        "            margin: 0 !important;\n" +
        "        }\n" +
        "        table,\n" +
        "        td {\n" +
        "            mso-table-lspace: 0pt !important;\n" +
        "            mso-table-rspace: 0pt !important;\n" +
        "        }\n" +
        "        table {\n" +
        "            border-spacing: 0 !important;\n" +
        "            border-collapse: collapse !important;\n" +
        "            table-layout: fixed !important;\n" +
        "            margin: 0 auto !important;\n" +
        "        }\n" +
        "        img {\n" +
        "            -ms-interpolation-mode:bicubic;\n" +
        "        }\n" +
        "        a {\n" +
        "            text-decoration: none;\n" +
        "        }\n" +
        "        *[x-apple-data-detectors],  /* iOS */\n" +
        "        .unstyle-auto-detected-links *,\n" +
        "        .aBn {\n" +
        "            border-bottom: 0 !important;\n" +
        "            cursor: default !important;\n" +
        "            color: inherit !important;\n" +
        "            text-decoration: none !important;\n" +
        "            font-size: inherit !important;\n" +
        "            font-family: inherit !important;\n" +
        "            font-weight: inherit !important;\n" +
        "            line-height: inherit !important;\n" +
        "        }\n" +
        "        .a6S {\n" +
        "            display: none !important;\n" +
        "            opacity: 0.01 !important;\n" +
        "        }\n" +
        "        /* What it does: Prevents Gmail from changing the text color in conversation threads. */\n" +
        "        .im {\n" +
        "            color: inherit !important;\n" +
        "        }\n" +
        "        /* If the above doesn't work, add a .g-img class to any image in question. */\n" +
        "        img.g-img + div {\n" +
        "            display: none !important;\n" +
        "        }\n" +
        "        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */\n" +
        "        /* Create one of these media queries for each additional viewport size you'd like to fix */\n" +
        "        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */\n" +
        "        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {\n" +
        "            u ~ div .email-container {\n" +
        "                min-width: 320px !important;\n" +
        "            }\n" +
        "        }\n" +
        "        /* iPhone 6, 6S, 7, 8, and X */\n" +
        "        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {\n" +
        "            u ~ div .email-container {\n" +
        "                min-width: 375px !important;\n" +
        "            }\n" +
        "        }\n" +
        "        /* iPhone 6+, 7+, and 8+ */\n" +
        "        @media only screen and (min-device-width: 414px) {\n" +
        "            u ~ div .email-container {\n" +
        "                min-width: 414px !important;\n" +
        "            }\n" +
        "        }\n" +
        "    </style>\n" +
        "    <style>\n" +
        "        .primary{\n" +
        "            background: #17BEBB;\n" +
        "        }\n" +
        "        .bg_white{\n" +
        "            background: #ffffff;\n" +
        "        }\n" +
        "        .bg_light{\n" +
        "            background: #fafafa;\n" +
        "        }\n" +
        "        .bg_black{\n" +
        "            background: #000000;\n" +
        "        }\n" +
        "        .bg_dark{\n" +
        "            background: rgba(0,0,0,.8);\n" +
        "        }\n" +
        "        .email-section{\n" +
        "            padding:2.5em;\n" +
        "        }\n" +
        "        /*BUTTON*/\n" +
        "        .btn{\n" +
        "            padding: 10px 15px;\n" +
        "            display: inline-block;\n" +
        "        }\n" +
        "        .btn.btn-primary{\n" +
        "            border-radius: 5px;\n" +
        "            background: #17BEBB;\n" +
        "            color: #ffffff;\n" +
        "        }\n" +
        "        .btn.btn-white{\n" +
        "            border-radius: 5px;\n" +
        "            background: #ffffff;\n" +
        "            color: #000000;\n" +
        "        }\n" +
        "        .btn.btn-white-outline{\n" +
        "            border-radius: 5px;\n" +
        "            background: transparent;\n" +
        "            border: 1px solid #fff;\n" +
        "            color: #fff;\n" +
        "        }\n" +
        "        .btn.btn-black-outline{\n" +
        "            border-radius: 0px;\n" +
        "            background: transparent;\n" +
        "            border: 2px solid #000;\n" +
        "            color: #000;\n" +
        "            font-weight: 700;\n" +
        "        }\n" +
        "        h1,h2,h3,h4,h5,h6{\n" +
        "            font-family: 'Lato', sans-serif;\n" +
        "            color: #000000;\n" +
        "            margin-top: 0;\n" +
        "            font-weight: 400;\n" +
        "        }\n" +
        "        body{\n" +
        "            font-family: 'Lato', sans-serif;\n" +
        "            font-weight: 400;\n" +
        "            font-size: 15px;\n" +
        "            line-height: 1.8;\n" +
        "            color: rgba(0,0,0,.4);\n" +
        "        }\n" +
        "        a{\n" +
        "            color: #17BEBB;\n" +
        "        }\n" +
        "        table{\n" +
        "        }\n" +
        "        /*LOGO*/\n" +
        "        .logo h1{\n" +
        "            margin: 0;\n" +
        "        }\n" +
        "        .logo h1 a{\n" +
        "            color: #17BEBB;\n" +
        "            font-size: 24px;\n" +
        "            font-weight: 700;\n" +
        "            font-family: 'Lato', sans-serif;\n" +
        "        }\n" +
        "        /*HERO*/\n" +
        "        .hero{\n" +
        "            position: relative;\n" +
        "            z-index: 0;\n" +
        "        }\n" +
        "        .hero .text{\n" +
        "            color: rgba(0,0,0,.3);\n" +
        "        }\n" +
        "        .hero .text h2{\n" +
        "            color: #000;\n" +
        "            font-size: 40px;\n" +
        "            margin-bottom: 0;\n" +
        "            font-weight: 400;\n" +
        "            line-height: 1.4;\n" +
        "        }\n" +
        "        .hero .text h3{\n" +
        "            font-size: 24px;\n" +
        "            font-weight: 300;\n" +
        "        }\n" +
        "        .hero .text h2 span{\n" +
        "            font-weight: 600;\n" +
        "            color: #17BEBB;\n" +
        "        }\n" +
        "        /*HEADING SECTION*/\n" +
        "        .heading-section{\n" +
        "        }\n" +
        "        .heading-section h2{\n" +
        "            color: #000000;\n" +
        "            font-size: 28px;\n" +
        "            margin-top: 0;\n" +
        "            line-height: 1.4;\n" +
        "            font-weight: 400;\n" +
        "        }\n" +
        "        .heading-section .subheading{\n" +
        "            margin-bottom: 20px !important;\n" +
        "            display: inline-block;\n" +
        "            font-size: 13px;\n" +
        "            text-transform: uppercase;\n" +
        "            letter-spacing: 2px;\n" +
        "            color: rgba(0,0,0,.4);\n" +
        "            position: relative;\n" +
        "        }\n" +
        "        .heading-section .subheading::after{\n" +
        "            position: absolute;\n" +
        "            left: 0;\n" +
        "            right: 0;\n" +
        "            bottom: -10px;\n" +
        "            content: '';\n" +
        "            width: 100%;\n" +
        "            height: 2px;\n" +
        "            background: #17BEBB;\n" +
        "            margin: 0 auto;\n" +
        "        }\n" +
        "        .heading-section-white{\n" +
        "            color: rgba(255,255,255,.8);\n" +
        "        }\n" +
        "        .heading-section-white h2{\n" +
        "            font-family:\n" +
        "            line-height: 1;\n" +
        "            padding-bottom: 0;\n" +
        "        }\n" +
        "        .heading-section-white h2{\n" +
        "            color: #ffffff;\n" +
        "        }\n" +
        "        .heading-section-white .subheading{\n" +
        "            margin-bottom: 0;\n" +
        "            display: inline-block;\n" +
        "            font-size: 13px;\n" +
        "            text-transform: uppercase;\n" +
        "            letter-spacing: 2px;\n" +
        "            color: rgba(255,255,255,.4);\n" +
        "        }\n" +
        "        ul.social{\n" +
        "            padding: 0;\n" +
        "        }\n" +
        "        ul.social li{\n" +
        "            display: inline-block;\n" +
        "            margin-right: 10px;\n" +
        "        }\n" +
        "        /*FOOTER*/\n" +
        "        .footer{\n" +
        "            border-top: 1px solid rgba(0,0,0,.05);\n" +
        "            color: rgba(0,0,0,.5);\n" +
        "        }\n" +
        "        .footer .heading{\n" +
        "            color: #000;\n" +
        "            font-size: 20px;\n" +
        "        }\n" +
        "        .footer ul{\n" +
        "            margin: 0;\n" +
        "            padding: 0;\n" +
        "        }\n" +
        "        .footer ul li{\n" +
        "            list-style: none;\n" +
        "            margin-bottom: 10px;\n" +
        "        }\n" +
        "        .footer ul li a{\n" +
        "            color: rgba(0,0,0,1);\n" +
        "        }\n" +
        "        @media screen and (max-width: 500px) {\n" +
        "        }\n" +
        "    </style>\n" +
        "</head>\n" +
        "<body width=\"100%\" style=\"margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;\">\n" +
        "<center style=\"width: 100%; background-color: #f1f1f1;\">\n" +
        "    <div style=\"display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;\">\n" +
        "        &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;\n" +
        "    </div>\n" +
        "    <div style=\"max-width: 600px; margin: 0 auto;\" class=\"email-container\">\n" +
        "\n" +
        "        <table align=\"center\" role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"margin: auto;\">\n" +
        "            <tr>\n" +
        "                <td valign=\"top\" class=\"bg_white\" style=\"padding: 1em 2.5em 0 2.5em;\">\n" +
        "                    <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">\n" +
        "                        <tr>\n" +
        "                            <td class=\"logo\" style=\"text-align: center;\">\n" +
        "                                <img src=\"http://localhost:3001/logo.png\" width=\"300\">\n" +
        "                            </td>\n" +
        "                        </tr>\n" +
        "                    </table>\n" +
        "                </td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td valign=\"middle\" class=\"hero bg_white\" style=\"padding: 3em 0 2em 0;\">\n" +
        "                    <img src=\"http://localhost:3001/email.png\" alt=\"\" style=\"width:80px; max-width:100px; height: auto; margin: auto; display: block;\">\n" +
        "                </td>\n" +
        "            </tr>\n" +
        "            <tr>\n" +
        "                <td valign=\"middle\" class=\"hero bg_white\" style=\"padding: 2em 0 4em 0;\">\n" +
        "                    <table>\n" +
        "                        <tr>\n" +
        "                            <td>\n" +
        "                                <div class=\"text\" style=\"padding: 0 2.5em; text-align: center;\">\n" +
        "                                    <h2>Hi "+name+"</h2>\n" +
        "                                    <h3>click on the button below to reset your password</h3>\n" +
        "                                    <p><a href="+url+" class=\"btn btn-primary\">Reset</a></p>\n" +
        "                                </div>\n" +
        "                            </td>\n" +
        "                        </tr>\n" +
        "                    </table>\n" +
        "                </td>\n" +
        "            </tr>\n" +
        "\n" +
        "        </table>\n" +
        "        <table align=\"center\" role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\" style=\"margin: auto;\">\n" +
        "            <tr>\n" +
        "                <td valign=\"middle\" class=\"bg_light footer email-section\">\n" +
        "                    <table>\n" +
        "                        <tr>\n" +
        "                            <td valign=\"top\" width=\"33.333%\" style=\"padding-top: 20px;\">\n" +
        "                                <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" width=\"100%\">\n" +
        "                                    <tr>\n" +
        "                <td valign=\"middle\" class=\"bg_light footer email-section\">\n" +
        "                    <table>\n" +
        "                        <tr>\n" +
        "                            <td class=\"bg_light\" style=\"text-align: center;\">\n" +
        "                                <p>Copyright © "+new Date().getFullYear()+" Driving School Platform - All Rights Reserved</p>\n" +
        "                            </td>\n" +
        "                        </tr>\n" +
        "                    </table>\n" +
        "                </td>\n" +
        "            </tr>\n" +
        "                                </table>\n" +
        "                            </td>\n" +
        "                        </tr>\n" +
        "                    </table>\n" +
        "                </td>\n" +
        "            </tr>\n" +
        "        </table>\n" +
        "    </div>\n" +
        "</center>\n" +
        "<script src=\"https://ajax.cloudflare.com/cdn-cgi/scripts/7089c43e/cloudflare-static/rocket-loader.min.js\" data-cf-settings=\"c38061e07454907fb2e38181-|49\" defer=\"\"></script></body>\n" +
        "</html>"
}

