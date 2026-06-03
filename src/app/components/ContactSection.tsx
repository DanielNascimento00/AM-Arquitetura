import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [focused, setFocused] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "amarqemarcenaria@gmail.com" },
    { icon: Phone, label: "Telefone", value: "+55 (11) 99499-7722" },
    { icon: MapPin, label: "Endereço", value: "São Paulo, Brasil" },
  ];

  return (
    <section id="contact" className="py-28 md:py-36 bg-[#0A0F0F] px-6 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6">
              <span className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase" style={{ fontWeight: 500 }}>
                ENTRE EM CONTATO
              </span>
            </div>
            <h2 className="text-[42px] md:text-[56px] mb-6 text-[#F2F0EA]" style={{ fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Vamos Criar Seu Projeto
            </h2>
            <p className="text-[#A7A39B] text-lg mb-12 leading-relaxed" style={{ fontWeight: 400 }}>
              Pronto para transformar seu espaço? Entre em contato e vamos criar juntos um ambiente único e sofisticado.
            </p>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#B59F78]/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-[#B59F78]" />
                  </div>
                  <div>
                    <div className="text-[#A7A39B] text-sm mb-1" style={{ fontWeight: 400 }}>
                      {info.label}
                    </div>
                    <div className="text-[#F2F0EA] text-lg" style={{ fontWeight: 500 }}>
                      {info.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={() => setFocused({ ...focused, name: true })}
                  onBlur={() => setFocused({ ...focused, name: formData.name !== "" })}
                  className="w-full px-6 py-4 bg-[#0C1111] border border-white/5 rounded-[12px] text-[#F2F0EA] focus:border-[#B59F78] focus:outline-none transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  required
                />
                <label
                  htmlFor="name"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focused.name || formData.name
                      ? "top-2 text-xs text-[#B59F78]"
                      : "top-1/2 -translate-y-1/2 text-base text-[#A7A39B]"
                  }`}
                  style={{ fontWeight: 400 }}
                >
                  Seu Nome
                </label>
              </div>

              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocused({ ...focused, email: true })}
                  onBlur={() => setFocused({ ...focused, email: formData.email !== "" })}
                  className="w-full px-6 py-4 bg-[#0C1111] border border-white/5 rounded-[12px] text-[#F2F0EA] focus:border-[#B59F78] focus:outline-none transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  required
                />
                <label
                  htmlFor="email"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focused.email || formData.email
                      ? "top-2 text-xs text-[#B59F78]"
                      : "top-1/2 -translate-y-1/2 text-base text-[#A7A39B]"
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Endereço de Email
                </label>
              </div>

              {/* Phone Field */}
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  onFocus={() => setFocused({ ...focused, phone: true })}
                  onBlur={() => setFocused({ ...focused, phone: formData.phone !== "" })}
                  className="w-full px-6 py-4 bg-[#0C1111] border border-white/5 rounded-[12px] text-[#F2F0EA] focus:border-[#B59F78] focus:outline-none transition-all duration-300"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <label
                  htmlFor="phone"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focused.phone || formData.phone
                      ? "top-2 text-xs text-[#B59F78]"
                      : "top-1/2 -translate-y-1/2 text-base text-[#A7A39B]"
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Telefone (Opcional)
                </label>
              </div>

              {/* Message Field */}
              <div className="relative">
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  onFocus={() => setFocused({ ...focused, message: true })}
                  onBlur={() => setFocused({ ...focused, message: formData.message !== "" })}
                  rows={5}
                  className="w-full px-6 py-4 bg-[#0C1111] border border-white/5 rounded-[12px] text-[#F2F0EA] focus:border-[#B59F78] focus:outline-none transition-all duration-300 resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  required
                />
                <label
                  htmlFor="message"
                  className={`absolute left-6 transition-all duration-300 pointer-events-none ${
                    focused.message || formData.message
                      ? "top-2 text-xs text-[#B59F78]"
                      : "top-6 text-base text-[#A7A39B]"
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sua Mensagem
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-[#B59F78] text-[#050808] rounded-full flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#C8B28A]"
                style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.02em', boxShadow: '0 10px 30px rgba(181, 159, 120, 0.3)' }}
              >
                Enviar Mensagem
                <Send size={20} />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}