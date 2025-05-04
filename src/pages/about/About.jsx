import React from 'react';
import Layout from '../../components/layout/Layout';
import manith from "../../assets/directors_img/manith.jpg"
import prakash from "../../assets/directors_img/prakash.png"
import uma from "../../assets/directors_img/uma.jpg"
import srinivas from "../../assets/directors_img/srinivas.jpeg"
import samyuktha from "../../assets/directors_img/samyuktha.jpeg"
import vamshi from "../../assets/directors_img/vamshi.jpeg"

const AboutPage = () => {
    const teamMembers = [
        {
            name: "Samyuktha Penta",
            role: "Head of Navedhana Pvt Ltd",
            imageUrl: samyuktha,
            linkedin: "#url",
            instagram: "#url",
        },
        {
            name: "Srinivas Depally",
            role: "Director of Navedhana Pvt Ltd",
            imageUrl: srinivas,
            linkedin: "#url",
            instagram: "#url",
        },
        {
            name: "Om Prakash Vadlapudi",
            role: "Founder of Navedhana Pvt Ltd",
            imageUrl: prakash,
            linkedin: "https://www.linkedin.com/in/om-prakash-593344260/",
            instagram: "https://www.instagram.com/ommprakash5556",
        },
        {
            name: "Manith Mettu",
            role: "Director & Co-Founder of Navedhana Pvt Ltd",
            imageUrl: manith,
            linkedin: "https://www.linkedin.com/in/manith-mettu-21a905259/",
            instagram: "https://www.instagram.com/m_n_t_.xox/",
        },
        {
            name: "Umadevi Komminni",
            role: "Co-Founder of Navedhana Pvt Ltd",
            imageUrl: uma,
            linkedin: "https://www.linkedin.com/in/umadevikomminni/",
            instagram: "https://www.instagram.com/___k_u_d_c___7554/",
        },
        {
            name: "Vamshi Krishna Pathamsetty",
            role: "Co-Founder of Navedhana Pvt Ltd",
            imageUrl: vamshi,
            linkedin: "https://www.linkedin.com/in/umadevikomminni/",
            instagram: "https://www.instagram.com/___k_u_d_c___7554/",
        },
    ];

    return (
       <Layout>
         <section className="about-section">
            <div className="container pd-12 mx-auto">
                <h2 className="text-center text-3xl font-bold mt-10"></h2>
                <p className="text-center mt-4 mb-12 text-lg">
                    Navedhana Pvt Ltd is an innovative platform committed to bridging the gap between farmers and consumers. Our mission is to ensure farmers receive fair market prices for their produce while delivering fresh vegetables directly to consumers within hours of harvest.
                </p>

                <div className="flex flex-wrap -m-4">
                    {/* Our Mission Section */}
                    <div className="p-4 w-full lg:w-1/2">
                        <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-medium text-green-600">Our Mission</h2>
                            <p className="mt-4 text-base">
                                At Navedhana, our mission is to revolutionize the agricultural supply chain by connecting farmers directly with consumers. We aim to eliminate middlemen, reduce market wastage, and provide fair compensation to farmers, while ensuring that consumers receive fresh, quality vegetables at competitive prices. By doing so, we create a win-win solution that benefits both ends of the supply chain.
                            </p>
                        </div>
                    </div>

                    {/* Our Values Section */}
                    <div className="p-4 w-full lg:w-1/2">
                        <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-medium text-green-600">Our Values</h2>
                            <ul className="mt-4 text-base list-disc list-inside">
                                <li>Empowerment of local farmers</li>
                                <li>Fair pricing and transparency</li>
                                <li>Commitment to freshness and quality</li>
                                <li>Efficient, sustainable practices</li>
                                <li>Customer satisfaction and convenience</li>
                            </ul>
                        </div>
                    </div>

                    {/* Our Journey Section */}
                    <div className="p-4 w-full lg:w-1/2">
                        <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-medium text-green-600">Our Journey</h2>
                            <p className="mt-4 text-base">
                                Navedhana started with a passion for solving inefficiencies in the agricultural supply chain. Initially a small group of dedicated individuals, we have grown into a company committed to connecting farmers directly with consumers. By focusing on same-day delivery of fresh vegetables, we are helping reduce food waste while improving the livelihood of farmers and the satisfaction of consumers.
                            </p>
                        </div>
                    </div>

                    {/* Meet Our Team Section */}
                    <div className="p-4 w-full lg:w-1/2">
                        <div className="h-full bg-white p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-medium text-green-600">Meet Our Team</h2>
                            <p className="mt-4 text-base">
                                Our team is composed of professionals from various backgrounds, all sharing the common goal of transforming the agricultural sector by creating a more equitable system for both farmers and consumers. We are passionate about making fresh, local produce accessible while ensuring that farmers are fairly compensated for their hard work.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="team-section mt-12">
                    <h3 className="text-center text-2xl font-semibold mb-8">Our Team</h3>
                    <div className="flex flex-wrap justify-center gap-8 sm:gap-6">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="w-56 sm:w-48 text-center flex-none sm:flex-auto mb-6"
                            >
                                <div className="team-grids">
                                    <img src={member.imageUrl} alt={member.name} className="w-32 h-32 mx-auto rounded-full object-cover" />
                                    <h4 className="mt-3 font-bold text-lg">{member.name}</h4>
                                    <h6 className="text-sm text-gray-600">{member.role}</h6>
                                    <div className="social-icons-section mt-2 flex justify-center space-x-4">
                                        <a href={member.linkedin} className="text-blue-500"><i className="fab fa-linkedin-in"></i></a>
                                        <a href={member.instagram} className="text-pink-500"><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
       </Layout>
    );
};

export default AboutPage;
