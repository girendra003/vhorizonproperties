import { Star, Quote } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { cn } from "@/lib/utils";

export default function TestimonialsSection() {
  const { testimonials } = useTestimonials();
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by India's most discerning property buyers and investors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={testimonial.id}
              className="bg-card p-6 rounded-xl border border-border shadow-card animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />

              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>

              {testimonial.propertyType && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Purchased: {testimonial.propertyType}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
