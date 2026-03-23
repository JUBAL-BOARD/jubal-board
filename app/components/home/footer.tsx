"use client";

import Image from "next/image";
import logo from "../../assets/logo.png";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "../../icons";
import { MapPin, Phone, Mail } from "lucide-react";
import { footerColumns, contactItems } from "../../data";

const contactIconMap: Record<string, React.ReactNode> = {
  map: <MapPin size={18} className="text-white" />,
  phone: <Phone size={18} className="text-white" />,
  mail: <Mail size={18} className="text-white" />,
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a1a3e] text-white">

      {/* Main Footer Grid */}
      <div className="px-8 py-12 grid grid-cols-4 gap-10">

        {/* Link Columns */}
        {Object.entries(footerColumns).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-[#E2554F] text-[15px] font-bold mb-[18px] mt-0">
              {section}
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-white/75 text-[13px] no-underline hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Column */}
        <div>
          <h4 className="text-[#e2554f] text-[15px] font-bold mb-[18px] mt-0">
            Contact Us
          </h4>
          <div className="flex flex-col gap-3.5">
            {contactItems.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-[34px] h-[34px] rounded-lg bg-[#E2554F] flex items-center justify-center flex-shrink-0">
                  {contactIconMap[item.iconKey]}
                </div>
                <div>
                  {item.lines.map((line, j) => (
                    <p key={j} className="m-0 mb-0.5 text-[13px] text-white/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 px-8 py-[18px] flex items-center justify-between">

        <div className="flex items-center gap-2.5">
          <Image
            src={logo}
            alt="Jubal Board logo"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>

        <span className="text-[#E2554F] text-[13px]">
          Copyright © Jubal Board 2025. All rights reserved.
        </span>

        <div className="flex gap-4 items-center text-white/80">
          <FacebookIcon />
          <InstagramIcon />
          <XIcon />
          <YoutubeIcon />
        </div>

      </div>
    </footer>
  );
};

export default Footer;