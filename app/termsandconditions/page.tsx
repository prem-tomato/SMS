"use client";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="content">
        {/* Hero Section */}
        <div className="bg-[#2863EB] text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">
              Terms & Conditions
              <div className="w-32 h-1 bg-white mx-auto mt-4 rounded"></div>
            </h1>
          </div>
        </div>

        {/* Terms Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Welcome to Tomato Games. Please read these terms and conditions
              carefully before using the game.
            </p>

            {/* Terms Sections */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Acceptance of Terms
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    By accessing or using the Tomato Games, you agree to be
                    bound by these terms and conditions. If you do not agree to
                    these terms and conditions, do not use the app.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Applicable Law
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    These terms and conditions shall be governed by and
                    construed in accordance with the laws of Israel.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Use of the App
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    The Tomato Games is intended for use by children under the
                    age of 13. By using the app, you represent and warrant that
                    you are a parent or legal guardian of a child who is under
                    the age of 13, and that you have the right to agree to these
                    terms and conditions on behalf of your child.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  In-App Purchases
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    The Tomato Games offers in-app purchases. These purchases
                    are optional and are not required to use the app. If you
                    choose to make an in-app purchase, you will be charged the
                    price displayed in the app. In-app purchases are
                    non-refundable.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Intellectual Property
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    All content and materials included in the Tomato Games,
                    including text, graphics, logos, images, and software, are
                    the property of Tomato Games or its licensors and are
                    protected by Israeli and international copyright and
                    trademark laws.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  User Conduct
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    You agree to use the Tomato Games only for lawful purposes
                    and in accordance with these terms and conditions. You agree
                    not to use the app in any way that could damage or impair
                    the app or interfere with any other party's use or enjoyment
                    of the app.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  COPPA Compliance
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    The Tomato Games is designed to comply with the Children's
                    Online Privacy Protection Act (COPPA). We do not collect
                    personal information from children under 13 without
                    verifiable parental consent. If you are a parent or guardian
                    and you believe your child has provided us with personal
                    information without your consent, please contact us at{" "}
                    <a
                      href="mailto:info@tomatogames.in"
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      info@tomatogames.in
                    </a>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Limitations on Liability
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    To the fullest extent permitted by law, Tomato Games will
                    not be liable for any damages of any kind arising from the
                    use of the app, including but not limited to direct,
                    indirect, incidental, punitive, and consequential damages.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Third-Party Services
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    The Tomato Games may use third-party services and software
                    to provide certain features and functionality. By using the
                    app, you agree to be bound by the terms and conditions of
                    these third-party services and software. We are not
                    responsible for the privacy practices or content of these
                    third-party services and software.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Arbitration
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    Any disputes arising from the use of the Tomato Games app
                    shall be resolved through binding arbitration in accordance
                    with Israeli law.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Indemnification
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    You agree to indemnify and hold harmless Tomato Games, its
                    affiliates, and their respective officers, directors,
                    employees, and agents from any and all claims, damages,
                    losses, liabilities, costs, and expenses (including
                    reasonable attorneys' fees) arising from your use of the app
                    or your breach of these terms and conditions.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Termination
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    We reserve the right to terminate your use of the Tomato
                    Games app at any time and for any reason.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Changes to Terms and Conditions
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    We reserve the right to modify or update these terms and
                    conditions at any time without prior notice. Your continued
                    use of the app after any changes to these terms and
                    conditions constitutes your acceptance of the changes.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Disclaimer of Warranties
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    The Tomato Games is provided on an "as is" and "as
                    available" basis. We make no representations or warranties
                    of any kind, express or implied, regarding the app or its
                    operation. We disclaim all warranties, including but not
                    limited to the implied warranties of merchantability,
                    fitness for a particular purpose, and non-infringement.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Entire Agreement
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    These terms and conditions constitute the entire agreement
                    between you and Tomato Games with respect to the use of the
                    app and supersede all prior or contemporaneous
                    communications and proposals, whether oral or written,
                    between you and Tomato Games.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-red-200 pb-2">
                  Contact Us
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    If you have any questions or concerns about these terms and
                    conditions or the Tomato Games, please contact us at{" "}
                    <a
                      href="mailto:info@tomatogames.in"
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      info@tomatogames.in
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <ul className="flex space-x-6 mb-4 md:mb-0">
              <li>
                <a
                  href="#"
                  className="hover:text-red-400 transition-colors duration-200"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-red-400 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>

            <div className="text-center md:text-right">
              <div className="text-sm text-gray-300 mb-1">
                © Tomato Games 2017 - All rights reserved
              </div>
              <div className="text-xs text-gray-400">Powered by M51</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
