import Image from "next/image";
import logo from "../../assets/icononly.png";

const VerificationLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
    {/* Logo */}
    <div className="flex items-center h-[70px] lg:h-[100px] bg-white px-5 lg:px-10">
            <Image
              src={logo}
              alt="Jubal Board logo"
              width={150}
              height={150}
              className="object-contain w-[110px] lg:w-[150px]"
            />
          </div>
    {children}
  </div>
);

export default VerificationLayout;