import { useState, useMemo, useEffect, useRef, useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '../components/layout/PageTemplate';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, X, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { fetchServiceCategories } from '@/lib/serviceCategories';
import { queryKeys } from '@/lib/queryKeys';
import { SpecializationTreeList } from '@/components/SpecializationTreeList';
import { Skeleton } from '@/components/ui/skeleton';

const ServicesPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const {
    data: allCategories = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.serviceCategories.items(),
    queryFn: fetchServiceCategories,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return allCategories.map(cat => ({
        ...cat,
        matchedSpecializations: [] as string[]
      }));
    }

    const query = deferredSearchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    const synonyms: Record<string, string[]> = {
      'fix': ['repair', 'maintenance', 'handyman', 'electrician', 'plumber', 'broken', 'damaged'],
      'repair': ['fix', 'maintenance', 'handyman', 'restoration'],
      'broken': ['repair', 'fix', 'damage'],
      'home': ['handyman', 'electrician', 'plumber', 'carpenter', 'renovation', 'house'],
      'renovation': ['remodeling', 'construction', 'handyman', 'carpenter'],
      'house': ['home', 'property', 'domestic', 'handyman', 'cleaning'],
      'yard': ['garden', 'landscaping', 'outdoor', 'lawn'],
      'maintenance': ['repair', 'fix', 'upkeep'],
      'teach': ['tutor', 'education', 'lessons', 'learning', 'school', 'class', 'course'],
      'learn': ['education', 'tutor', 'lessons', 'course', 'class', 'school'],
      'class': ['education', 'tutor', 'learning', 'course'],
      'course': ['education', 'learning', 'tutorial', 'online courses'],
      'training': ['lessons', 'coaching', 'teaching', 'education', 'fitness'],
      'coach': ['training', 'fitness', 'personal trainer', 'teaching'],
      'exercise': ['fitness', 'personal trainer', 'gym', 'workout', 'training'],
      'health': ['fitness', 'wellness', 'therapy', 'massage', 'medical'],
      'wellness': ['fitness', 'health', 'therapy', 'meditation', 'massage'],
      'gym': ['fitness', 'personal trainer', 'exercise'],
      'body': ['fitness', 'personal trainer', 'wellness'],
      'workout': ['fitness', 'exercise', 'training'],
      'care': ['babysitting', 'elderly', 'pet', 'personal services', 'assistance'],
      'help': ['assistant', 'support', 'service', 'consulting'],
      'babysit': ['babysitting', 'childcare', 'elderly care', 'personal services'],
      'pet': ['dog', 'cat', 'animal', 'pet care', 'grooming'],
      'dog': ['pet', 'pet care', 'walking', 'grooming'],
      'cat': ['pet', 'pet care', 'grooming'],
      'elderly': ['care', 'personal services', 'assistance'],
      'clean': ['cleaning', 'cleaner', 'housekeeping', 'janitor'],
      'dirty': ['cleaning', 'cleaner'],
      'tidy': ['cleaning', 'organization'],
      'sweep': ['cleaning', 'service'],
      'social': ['influencer', 'instagram', 'tiktok', 'youtube', 'content', 'marketing'],
      'instagram': ['influencer', 'social media', 'content creation'],
      'tiktok': ['influencer', 'social media', 'content'],
      'youtube': ['influencer', 'content creation', 'video'],
      'content': ['influencer', 'writing', 'creation', 'marketing', 'production'],
      'marketing': ['content', 'influencer', 'brand strategy', 'advertising'],
      'brand': ['marketing', 'consulting', 'branding'],
      'advertise': ['marketing', 'influencer', 'brand strategy'],
      'design': ['graphic', 'web', 'ui', 'ux', 'creative', 'app development'],
      'graphic': ['design', 'creative', 'visual'],
      'web': ['design', 'development', 'code', 'tech'],
      'creative': ['design', 'art', 'production'],
      'art': ['creative', 'design', 'photography'],
      'visual': ['design', 'graphic', 'photography'],
      'video': ['videography', 'filming', 'production', 'editing', 'youtube'],
      'photo': ['photography', 'photographer', 'pictures', 'portrait'],
      'picture': ['photography', 'image', 'visual'],
      'film': ['videography', 'production', 'movie'],
      'movie': ['videography', 'production', 'filming'],
      'production': ['videography', 'music', 'film', 'content'],
      'edit': ['video editing', 'editing', 'production'],
      'code': ['programming', 'development', 'tech', 'it', 'web', 'app'],
      'tech': ['technology', 'it support', 'development', 'web'],
      'website': ['web development', 'design', 'tech'],
      'app': ['app development', 'tech', 'development'],
      'digital': ['web', 'technology', 'apps', 'online'],
      'computer': ['tech', 'it support', 'technology', 'development'],
      'online': ['web', 'digital', 'internet', 'tech'],
      'cyber': ['cybersecurity', 'security', 'it'],
      'music': ['lessons', 'production', 'dj', 'performance', 'audio'],
      'song': ['music', 'production', 'composition'],
      'instrument': ['music', 'lessons', 'repair'],
      'dj': ['music', 'performance', 'entertainment'],
      'audio': ['music', 'sound design', 'podcast'],
      'business': ['consulting', 'professional', 'corporate', 'accounting', 'legal'],
      'money': ['financial', 'accounting', 'bookkeeping', 'financial planning'],
      'financial': ['money', 'accounting', 'consulting'],
      'accounting': ['financial', 'bookkeeping', 'professional'],
      'legal': ['law', 'professional', 'consulting'],
      'law': ['legal', 'professional services'],
      'consulting': ['business', 'professional', 'expert', 'advice'],
      'corporate': ['business', 'professional', 'consulting'],
      'office': ['professional', 'business', 'corporate'],
      'professional': ['business', 'consulting', 'expert', 'corporate'],
      'company': ['business', 'corporate', 'professional'],
      'move': ['moving', 'relocation', 'transportation', 'delivery'],
      'delivery': ['moving', 'transportation', 'shipping'],
      'transport': ['moving', 'delivery', 'driving', 'car'],
      'car': ['automotive', 'mechanic', 'vehicle', 'driving'],
      'vehicle': ['automotive', 'car', 'mechanic'],
      'mechanic': ['automotive', 'repair', 'vehicle'],
      'drive': ['transportation', 'driving', 'car'],
      'auto': ['automotive', 'car', 'mechanic', 'vehicle'],
      'event': ['planning', 'coordination', 'organization'],
      'party': ['event planning', 'entertainment'],
      'wedding': ['event planning', 'photography', 'videography'],
      'plan': ['event planning', 'organization'],
      'service': ['help', 'professional', 'consulting', 'support'],
      'job': ['work', 'task', 'project', 'service'],
      'work': ['job', 'freelancer', 'professional'],
      'task': ['job', 'service', 'help'],
      'project': ['freelancer', 'consulting', 'development'],
      'freelancer': ['work', 'professional', 'expert'],
      'expert': ['professional', 'specialist', 'consultant'],
      'specialist': ['expert', 'professional', 'consultant'],
      'talent': ['freelancer', 'expert', 'specialist'],
      'pro': ['professional', 'expert', 'specialist'],
    };

    return allCategories.map(cat => {
      const categoryName = cat.name.toLowerCase();
      const categoryDesc = cat.description.toLowerCase();
      const allText = `${categoryName} ${categoryDesc}`;

      const categoryMatches = queryWords.some(word => {
        if (allText.includes(word)) return true;
        const relatedWords = synonyms[word] || [];
        return relatedWords.some(synonym => allText.includes(synonym));
      });

      const matchedSpecializations: string[] = [];
      if (categoryMatches) {
        matchedSpecializations.push(...cat.subcategories.slice(0, 3));
      } else {
        cat.subcategories.forEach(sub => {
          const subName = sub.toLowerCase();
          const matches = queryWords.some(word => {
            if (subName.includes(word)) return true;
            const relatedWords = synonyms[word] || [];
            return relatedWords.some(synonym => subName.includes(synonym));
          });
          if (matches) {
            matchedSpecializations.push(sub);
          }
        });
      }

      return {
        ...cat,
        matchedSpecializations: matchedSpecializations.slice(0, 3)
      };
    }).filter(cat => cat.matchedSpecializations.length > 0 || queryWords.some(word => {
      const catText = `${cat.name.toLowerCase()} ${cat.description.toLowerCase()}`;
      if (catText.includes(word)) return true;
      const synonymsList = synonyms[word] || [];
      return synonymsList.some(syn => catText.includes(syn));
    }));
  }, [deferredSearchQuery, allCategories]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!hasAnimated.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.back-link', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
        gsap.fromTo('.service-item', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.4 });
      }, containerRef);
      hasAnimated.current = true;
      return () => ctx.revert();
    }
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <PageTemplate title="Current Services">
      <div className="space-y-16 lg:space-y-24" ref={containerRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-end back-link">
          <div>
            <button
              onClick={() => navigate('/#services')}
              className="group flex items-center gap-3 text-neutral-400 hover:text-black transition-colors mb-6"
            >
              <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all group-hover:border-black group-hover:bg-black group-hover:text-white">
                <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
              </div>
              <span className="text-sm font-medium uppercase tracking-widest">Back to expertise</span>
            </button>
            <h2 className="font-serif text-4xl lg:text-5xl text-black">Find your <span className="italic">expertise</span></h2>
          </div>

          <div className="relative w-full md:w-96" style={{ contain: 'layout style' }}>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full pl-14 pr-12 py-5 bg-neutral-50 rounded-full border border-neutral-100 focus:border-black outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isError ? (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <span>Services could not be loaded from the server.</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="shrink-0 px-4 py-2 rounded-full bg-amber-900 text-white text-xs font-semibold hover:bg-amber-800"
            >
              Retry
            </button>
          </div>
        ) : null}

        {/* Search results — grid view */}
        {isSearching && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            style={{ contain: 'layout style paint', willChange: 'contents' }}
          >
            {isPending ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="min-h-[22rem] rounded-[2.5rem] bg-neutral-100" />
              ))
            ) : (
              <>
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="service-item group relative bg-neutral-50 rounded-[2.5rem] overflow-hidden hover:bg-neutral-100 transition-colors duration-500 flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden flex-shrink-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    width={1600}
                    height={1000}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                  />
                </div>

                <div className="p-5 lg:p-7 flex-1 flex flex-col">
                  <div className="flex items-start justify-between w-full mb-3 flex-shrink-0">
                    <h3 className="font-serif text-lg lg:text-xl text-black leading-tight pr-2 flex-1 min-w-0">
                      {category.name}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300 flex-shrink-0" />
                  </div>

                  <p className="text-neutral-500 text-xs font-light mb-4 leading-relaxed line-clamp-3 flex-1 min-h-[2.5rem]">
                    {category.description}
                  </p>

                  {category.matchedSpecializations && category.matchedSpecializations.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-neutral-100">
                      <p className="text-[9px] uppercase tracking-[0.1em] text-neutral-400 font-semibold mb-1">Matched:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.matchedSpecializations.map((spec) => (
                          <span key={spec} className="text-[9px] bg-black text-white px-2 py-0.5 rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 pt-4 border-t border-neutral-200/50 flex-shrink-0">
                    <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-400 font-bold">
                      {category.subcategoryCount} Specializations
                    </span>
                    <button
                      onClick={() => navigate(`/category/${category.id}`)}
                      className="text-[10px] font-semibold hover:text-black transition-colors flex items-center justify-center gap-1 group/btn w-full py-2"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-2.5 h-2.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="col-span-full py-32 text-center bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
                <h3 className="font-serif text-3xl mb-4">Expertise not found</h3>
                <p className="text-neutral-500 max-w-sm mx-auto mb-10">
                  We couldn't find anything matching "<span className="text-black font-medium">{searchQuery}</span>".
                  Try searching for something else or contact us.
                </p>
                <button
                  onClick={() => navigate('/contact')}
                  className="px-10 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all"
                >
                  Suggest a category
                </button>
              </div>
            )}
              </>
            )}
          </div>
        )}

        {/* Default view — accordion list */}
        {!isSearching && (
          <div className="space-y-3">
            {isPending ? (
              Array.from({ length: 6 }).map((_, skelIdx) => (
                <Skeleton key={skelIdx} className="h-24 sm:h-28 w-full rounded-[1.75rem] bg-neutral-100" />
              ))
            ) : (
              <>
            {allCategories.map((category) => {
              const subcategories = category.subcategories;
              const specTree = category.specializationTree;
              const isExpanded = expandedIds.has(category.id);

              return (
                <div
                  key={category.id}
                  className="service-item border border-neutral-100 rounded-[1.75rem] overflow-hidden bg-white transition-shadow hover:shadow-sm"
                >
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleExpand(category.id)}
                    className="w-full flex items-center gap-0 text-left group"
                    aria-expanded={isExpanded}
                  >
                    {/* Image — fixed size, no flex-grow */}
                    <div className="w-24 h-20 sm:w-32 sm:h-24 shrink-0 overflow-hidden rounded-l-[1.75rem]">
                      <img
                        src={category.image}
                        alt={category.name}
                        width={256}
                        height={192}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 px-5 sm:px-7 py-4 sm:py-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-black leading-tight">
                            {category.name}
                          </h3>
                          <p className="text-neutral-500 text-xs sm:text-sm font-light mt-1 line-clamp-1">
                            {category.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:block text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                            {category.subcategoryCount} specializations
                          </span>
                          <div className={`w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white ${isExpanded ? 'bg-black border-black text-white' : 'text-neutral-400'}`}>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Accordion body — grid rows keep min-h-0 so inner overflow-y-auto can scroll (overflow-hidden + max-h fights touch scrolling). */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-neutral-100">
                        <div
                          className="max-h-[min(75dvh,36rem)] overflow-y-auto overscroll-y-contain px-5 pt-3 pb-2 sm:px-7 touch-pan-y [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
                        >
                          <p className="mb-3 text-[11px] text-neutral-500">
                            Expand a subject to see specializations. Scroll this list when there are many.
                          </p>
                          {specTree.length > 0 ? (
                            <SpecializationTreeList nodes={specTree} />
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pb-2">
                              {subcategories.map((sub) => (
                                <div
                                  key={sub}
                                  className="flex items-center gap-2 py-2 px-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
                                  <span className="text-xs text-neutral-600 leading-tight">{sub}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="px-5 sm:px-7 pb-5 pt-2">
                          <button
                            onClick={() => navigate(`/category/${category.id}`)}
                            className="group/btn flex items-center gap-2 text-sm font-semibold text-black hover:text-neutral-600 transition-colors"
                          >
                            Explore {category.name}
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </>
            )}
          </div>
        )}

        {/* CTA — only when not searching or results exist */}
        {(!isSearching || filteredCategories.length > 0) && (
          <section className="bg-black text-white p-12 lg:p-20 rounded-[3rem] text-center shadow-2xl shadow-black/20">
            <h2 className="font-serif text-4xl lg:text-6xl mb-8">
              Don't see your expertise?
            </h2>
            <p className="text-xl text-neutral-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              We are constantly expanding our horizons. Contact us and we will work on adding your specific skillset to the Skillance ecosystem.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-10 py-5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all hover:scale-[1.05]"
            >
              Contact us today
            </button>
          </section>
        )}
      </div>
    </PageTemplate>
  );
};

export default ServicesPage;
