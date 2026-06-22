import Navbar from "../components/Navbar";
import HeroSlider from "./HeroSlider";


export default function HomePage() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      <Navbar />

      <HeroSlider />

      {/* About Us */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-green-700">About Us</h2>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our MISSION is to educate and empower students by maintaining high expectations, fostering their success in life, and shaping respectful, responsible, and productive individuals who will contribute meaningfully to society.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Our VISION is to build a school community with qualified, self-disciplined staff; provide a conducive learning environment for all students; uphold high expectations for teaching and learning; collaborate with students and their families to ensure academic success; prevent conflict, bullying, and harassment among students and staff; and remain dedicated to continuous learning in order to achieve our goals and support student success.
          </p>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="py-16">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center text-green-700">
      Our Facilities
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

      {/* Facility 1 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/building.jpg"
          alt="Building"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Serene Learning Environment</h3>
        <p className="text-gray-600 mt-2">
          A clean, calm, and well-maintained environment that promotes effective
          learning and student well-being.
        </p>
      </div>

      {/* Facility 2 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/chemistry_lab.jpg"
          alt="Science Laboratories"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Science Laboratories</h3>
        <p className="text-gray-600 mt-2">
          Fully equipped Physics, Chemistry, and Biology labs for hands-on scientific discovery.
        </p>
      </div>

      {/* Facility 3 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/computer.jpg"
          alt="Computer Lab"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Computer Lab</h3>
        <p className="text-gray-600 mt-2">
          A modern ICT center with up-to-date systems to enhance digital literacy.
        </p>
      </div>

      {/* Facility 4 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/library.jpg"
          alt="Library"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Library</h3>
        <p className="text-gray-600 mt-2">
          A quiet and resource-rich library for effective study, research, and reading culture.
        </p>
      </div>

      {/* Facility 5 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/home_econs.jpg"
          alt="Modern Classrooms"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Vocational Studies Center</h3>
        <p className="text-gray-600 mt-2">
          A hands-on training center offering skills such as tailoring, catering,
          technical crafts, and entrepreneurship development.
        </p>
      </div>

      {/* Facility 6 */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-center hover:shadow-lg transition">
        <img
          src="/art.jpg"
          alt="Arts Studio"
          className="h-40 w-full object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-green-700">Arts Studio</h3>
        <p className="text-gray-600 mt-2">
          A creative hub for nurturing talent in music, fine arts, and performance.
        </p>
      </div>

    </div>
  </div>
      </section>


      {/* Contact Us */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-green-700">
            Contact Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Get in Touch
              </h3>
              <p className="mt-4 text-gray-600">
                Address: 7, Wowo Street, Olodi-Apapa, Lagos.
              </p>
              <p className="text-gray-600">Phone: +234 812 214 8113, +243</p>
              <p className="text-gray-600">Email: moonlightschool02@gmail.com</p>
            </div>
            <form className="bg-white shadow-md rounded-xl p-6 space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600"
              ></textarea>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Grayweb Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
