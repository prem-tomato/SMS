"use client";
import { Download, FileText } from "lucide-react";

const TermsConditionsComponent = () => {
  const handleDownloadPDF = () => {
    // Replace this URL with your actual PDF URL once uploaded
    const pdfUrl =
      "https://drive.google.com/file/d/1SoqNN9NtF929JjJysEUbqYMty49Vx1bp/view?usp=drive_link"; // e.g., "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"

    // Method 1: Direct download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Terms-and-Conditions.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Method 2: Open in new tab (alternative)
    // window.open(pdfUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#2863EB] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center">
            Terms & Conditions
            <span className="block w-24 h-1 bg-white mx-auto mt-4"></span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* PDF Download Button */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Download Complete Terms & Conditions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get the full PDF version for your records
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>View PDF</span>
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Terms & Conditions
          </h1>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* Introduction */}
            <section>
              <p className="mb-4">
                smartmanager.co.in provides its service to you, subject to the
                following Terms of Service ("TOS"), which may be updated /
                modified / changed by us from time to time without any notice to
                its users.
              </p>
            </section>

            {/* Acceptance */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Acceptance and Use of Terms and Conditions
              </h2>
              <p className="mb-4">
                Your access to and use of www.smartmanager.co.in is subject
                exclusively to these Terms and Conditions. You will not use the
                Website for any purpose that is unlawful or prohibited by these
                Terms and Conditions. By using the Website you are fully
                accepting the terms, conditions and disclaimers contained in
                this notice. If you do not accept these Terms and Conditions you
                must immediately stop using the Website.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Description of Service
              </h2>
              <p className="mb-4">
                smartmanager.co.in provides a private communication and
                management portal for the user's residential community & the
                business community. Tools and services on this portal are
                categorized as BASIC (free) and PREMIUM (subscription). PREMIUM
                service includes all features of the portal whereas BASIC
                service has a limited subset of features.
              </p>
            </section>

            {/* Privacy Policy */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Privacy Policy
              </h2>
              <p className="mb-4">
                Personal information about you are subject to our Privacy
                Policy. Your personal information belongs to you. We collect
                this type of information when you provide it, but we do NOT rent
                or sell information concerning our customers to third parties
                for ANY reason.
              </p>
            </section>

            {/* Links to Third Party Websites */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Links to Third Party Websites
              </h2>
              <p className="mb-4">
                smartmanager.co.in website may include links to third party
                websites that are controlled and maintained by others. Any link
                to other websites is not an endorsement of such websites and you
                acknowledge and agree that we are not responsible for the
                content or availability of any such sites.
              </p>
            </section>

            {/* User Account, Password and Security */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                User Account, Password and Security
              </h2>
              <p className="mb-4">
                After we create your account we force user to change their
                password to maintain the confidentiality. Therefore, you are
                responsible for maintaining the confidentiality of the UserID
                and password you choose, and are fully responsible for all
                activities that occur under your account. You hereby agree to:
              </p>
              <ul className="list-disc ml-6 mb-4 space-y-2">
                <li>
                  Immediately notify smartmanager.co.in of any unauthorized use
                  of your password
                </li>
                <li>
                  Protect your account information by ensuring that you exit
                  from your account at the end of each session using the Logout
                  link
                </li>
              </ul>
              <p className="mb-4">
                smartmanager.co.in cannot and will not be liable for any
                consequence arising from your failure to comply with this
                Section.
              </p>
            </section>

            {/* Property Rights */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Property Rights
              </h2>
              <p className="mb-4">
                You acknowledge and agree that the Service contains proprietary
                and confidential information that is protected by applicable
                intellectual property and other laws. Except as expressly
                authorized by www.smartmanager.co.in, you agree not to modify,
                rent, lease, loan, sell, distribute or create derivative works
                based on the Service, in whole or in part. You also agree not to
                extract the code or reverse-engineer it in anyway. Any attempt
                at hacking or unlawful use of www.smartmanager.co.in can and
                will invite the maximum prosecution allowable under the law.
              </p>
            </section>

            {/* Abuse of Service */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Abuse of Service
              </h2>
              <p className="mb-4">
                You understand that all information (such as data files, written
                text, audio files, images or any other media) which you may have
                access to as part of, or through your use of smartmanager.co.in
                are the sole responsibility of the person from which such
                content originated. smartmanager.co.in takes no responsibility
                for abusive content, and it is the responsibility of the users
                to regulate such content, smartmanager.co.in reserves the right
                to suspend its service to users involving in service abuse.
                smartmanager.co.in takes no responsibility for any data
                generated within smartmanager.co.in and published or distributed
                outside by the user.
              </p>
            </section>

            {/* No Resale of Service */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                No Resale of Service
              </h2>
              <p className="mb-4">
                You agree not to reproduce, duplicate, copy, sell, resell or
                exploit for any commercial purposes, any portion of the service,
                use of the Service, or access to the Service.
              </p>
            </section>

            {/* Online Payments */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Online Payments
              </h2>
              <p className="mb-4">
                Tomato Technologies LLP integrates in its Products with many
                Third Party / Banks Payment Gateways. The usage of the Payment
                Gateway integrated with products of Tomato Technologies LLP.
                will be governed and or subject to the Payment Gateway Terms &
                Conditions.
              </p>
            </section>

            {/* How You May Use Our Marks */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                How You May Use Our Marks
              </h2>
              <p className="mb-4">
                The smartmanager.co.in company names and logos and all related
                products and service names, design marks and slogans are
                trademarks and service marks owned by and used under license
                from smartmanager.co.in or its wholly-owned subsidiaries. All
                other trademarks and service marks herein are the property of
                their respective owners. You are not authorized to use any
                smartmanager.co.in name or mark in any advertising, publicity or
                in any other commercial manner without the prior written consent
                of smartmanager.co.in. Requests for authorization should be made
                to tinfotech12@gmail.com
              </p>
            </section>

            {/* List of Prohibited Items */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                List of Prohibited Items
              </h2>
              <p className="mb-4">
                Users of smartmanager.co.in are prohibited from aiding in the
                sale/exchange of any items mentioned in the below list. The list
                is partial in nature and the same will be modified/updated as
                and when any items become prohibited by law:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
                <ul className="list-disc ml-6 space-y-1">
                  <li>Airline tickets that restrict transfer</li>
                  <li>Alcohol or tobacco products</li>
                  <li>Blood, bodily fluids or body parts</li>
                  <li>Bulk email or mailing lists</li>
                  <li>Burglary tools</li>
                  <li>Controlled substances or illegal drugs</li>
                  <li>Counterfeit currency and stamps</li>
                </ul>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Counterfeit brand name goods</li>
                  <li>False identification cards</li>
                  <li>Fireworks, firearms and explosives</li>
                  <li>Gambling items</li>
                  <li>Copyright infringing material</li>
                  <li>Pornography</li>
                  <li>Prescription drugs and medical devices</li>
                </ul>
              </div>
            </section>

            {/* Modification to Service */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Modification to Service
              </h2>
              <p className="mb-4">
                smartmanager.co.in reserves the right at any time to modify or
                discontinue, temporarily or permanently, the Service (or any
                part thereof). This will take place with notice and adequate
                time given to you, so that you may retain the information assets
                created by you on smartmanager.co.in. Beyond the time given, you
                agree that smartmanager.co.in shall not be liable to you or to
                any third party.
              </p>
            </section>

            {/* Content Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Content Disclaimer
              </h2>
              <p className="mb-4">
                smartmanager.co.in communicates information provided and created
                by advertisers, content partners, software developers,
                publishers, marketing agents, employees, users, resellers and
                other third parties. While every attempt has been made to
                ascertain the authenticity of the content on the Platforms
                smartmanager.co.in has no control over content, the accuracy of
                such content, integrity or quality of such content and the
                information on our pages, and material on the Platforms may
                include technical inaccuracies or typographical errors.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Limitation of Liability
              </h2>
              <p className="mb-4">
                In no event shall either party's aggregate liability arising out
                of or related to these Terms/Agreement, whether in contract,
                tort or under any other theory of liability, exceed the total
                amount paid by you under the current active Premium Agreement.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Indemnification
              </h2>
              <p className="mb-4">
                You agree to indemnify and hold smartmanager.co.in. and (as
                applicable) our parent, subsidiaries, affiliates, officers,
                directors, agents, and employees, harmless from all liabilities,
                legal fees, damages, losses, costs and any other expenses in
                relation or demand, including reasonable attorneys' fees, made
                by any third party due to or arising out of your breach of these
                Terms.
              </p>
            </section>

            {/* Promotional Offers */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Promotional Offers
              </h2>
              <p className="mb-4">
                The promotional offers as may be decided by the company from
                time to time will be for the limited period and company is not
                bound to extend those and or similar benefits to their
                subscriber. The company may at its own discretion may extend /
                curtail the offer period / terms and condition as may be
                required without any information.
              </p>
            </section>

            {/* Contact Information */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Contact Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong>Address:</strong>
                </p>
                <p className="mb-1">313, Sunshine Complex near Sudama Chow</p>
                <p className="mb-1">Mota Varachha, Surat</p>
                <p className="mb-3">Pin - 394101</p>
                <p>
                  <strong>Email:</strong> tinfotech12@gmail.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="hover:text-red-400 transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                Privacy Policy
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2">
                © smartmanager.co.in 2024 - All rights reserved
              </p>
              <p className="text-sm text-gray-400">
                Powered by Tomato Technologies LLP
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsConditionsComponent;
