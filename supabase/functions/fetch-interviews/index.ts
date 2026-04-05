import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Real interview questions by tech stack
const questionBank: Record<string, any[]> = {
  "react": [
    { question: "What is state in React?", type: "conceptual", ideal_answer: "State is mutable data that affects rendering. Use useState hook.", difficulty: "beginner", follow_up: "How to update state?" },
    { question: "Explain React hooks", type: "conceptual", ideal_answer: "Hooks let you use state in functional components. Examples: useState, useEffect, useContext.", difficulty: "intermediate", follow_up: "What are rules of hooks?" },
    { question: "What is virtual DOM?", type: "conceptual", ideal_answer: "In-memory representation of actual DOM. React uses it for efficient updates.", difficulty: "intermediate", follow_up: "How does diffing work?" },
    { question: "Write a custom hook for form handling", type: "coding", ideal_answer: "Use useState to track input values and create onChange handler", difficulty: "intermediate", follow_up: "Handle validation?" },
    { question: "Explain useEffect dependency array", type: "conceptual", ideal_answer: "Empty array = runs once. Omit = runs every render. Array with deps = runs when deps change.", difficulty: "beginner", follow_up: "Cleanup functions?" },
    { question: "What is context API?", type: "conceptual", ideal_answer: "Share state between components without prop drilling. Use createContext and useContext.", difficulty: "intermediate", follow_up: "When not to use context?" },
  ],
  "python": [
    { question: "What are decorators in Python?", type: "conceptual", ideal_answer: "Functions that modify other functions. Example: @property, @staticmethod.", difficulty: "intermediate", follow_up: "Create custom decorator?" },
    { question: "Explain list comprehensions", type: "conceptual", ideal_answer: "Concise syntax: [x*2 for x in range(10)]. More readable and faster.", difficulty: "beginner", follow_up: "Nested comprehensions?" },
    { question: "What is the GIL?", type: "conceptual", ideal_answer: "Global Interpreter Lock prevents multiple threads from executing Python simultaneously. Use multiprocessing for CPU-bound work.", difficulty: "advanced", follow_up: "How to work around it?" },
    { question: "Find common elements in two lists", type: "coding", ideal_answer: "list(set(list1) & set(list2)) or [x for x in list1 if x in list2]", difficulty: "beginner", follow_up: "Time complexity?" },
    { question: "Explain generators and yield", type: "conceptual", ideal_answer: "Generators are lazy iterators. Yield returns one value at a time, saves memory.", difficulty: "intermediate", follow_up: "When to use generators?" },
    { question: "What is *args and **kwargs?", type: "conceptual", ideal_answer: "*args captures positional arguments as tuple. **kwargs captures keyword arguments as dict.", difficulty: "intermediate", follow_up: "Example use case?" },
  ],
  "java": [
    { question: "Explain checked vs unchecked exceptions", type: "conceptual", ideal_answer: "Checked: must catch/declare (IOException). Unchecked: don't require handling (NullPointerException).", difficulty: "intermediate", follow_up: "Which to use?" },
    { question: "What is inheritance?", type: "conceptual", ideal_answer: "Class hierarchy where child inherits from parent. Use 'extends' keyword.", difficulty: "beginner", follow_up: "Multiple inheritance?" },
    { question: "ArrayList vs LinkedList?", type: "conceptual", ideal_answer: "ArrayList: O(1) access, O(n) insertion. LinkedList: O(n) access, O(1) insertion.", difficulty: "intermediate", follow_up: "When to use each?" },
    { question: "Write a multithreading program", type: "coding", ideal_answer: "class MyThread implements Runnable { public void run(){...} } new Thread(new MyThread()).start();", difficulty: "intermediate", follow_up: "Synchronize threads?" },
    { question: "What is finally block?", type: "conceptual", ideal_answer: "Executes regardless of try/catch. Used for resource cleanup. Runs even if return statement.", difficulty: "beginner", follow_up: "Always executes?" },
    { question: "Explain polymorphism", type: "conceptual", ideal_answer: "Objects can take multiple forms. Achieved through method overriding and overloading.", difficulty: "intermediate", follow_up: "Runtime vs compile-time?" },
  ],
  "typescript": [
    { question: "Interface vs Type in TypeScript?", type: "conceptual", ideal_answer: "Interfaces define object contracts. Types are more flexible (primitives, unions, etc).", difficulty: "intermediate", follow_up: "When to use each?" },
    { question: "Explain generics", type: "conceptual", ideal_answer: "function<T>(arg: T): T allows reusable type-safe components.", difficulty: "intermediate", follow_up: "Generic constraints?" },
    { question: "What are utility types?", type: "conceptual", ideal_answer: "Built-in transformations: Partial, Pick, Omit, Record, etc.", difficulty: "intermediate", follow_up: "Create custom utility?" },
    { question: "Merge two objects with types", type: "coding", ideal_answer: "function merge<T, U>(obj1: T, obj2: U): T & U { return {...obj1, ...obj2} }", difficulty: "intermediate", follow_up: "Handle key conflicts?" },
    { question: "unknown vs any", type: "conceptual", ideal_answer: "any disables type checking. unknown requires type checking before use.", difficulty: "beginner", follow_up: "Why use unknown?" },
    { question: "Explain enums", type: "conceptual", ideal_answer: "Named set of constants. Can be numeric or string.", difficulty: "beginner", follow_up: "String vs numeric enums?" },
  ],
  "general": [
    { question: "Tell me about a challenging project", type: "behavioral", ideal_answer: "Describe situation, your role, actions taken, measurable results.", difficulty: "beginner", follow_up: "What would you do differently?" },
    { question: "How do you debug production issues?", type: "behavioral", ideal_answer: "Reproduce, check logs, isolate cause, test fix, deploy carefully.", difficulty: "intermediate", follow_up: "Recent example?" },
    { question: "Why are you interested in this role?", type: "behavioral", ideal_answer: "Align personal interests with company mission and role requirements.", difficulty: "beginner", follow_up: "What about this company appeals to you?" },
    { question: "Design a system for millions of users", type: "system-design", ideal_answer: "Database sharding, caching (Redis), load balancing, CDN, monitoring.", difficulty: "advanced", follow_up: "Handle failures?" },
    { question: "How do you approach learning new tech?", type: "behavioral", ideal_answer: "Read docs, build projects, practice, teach others.", difficulty: "beginner", follow_up: "Recent tech learned?" },
    { question: "Explain a technical concept simply", type: "behavioral", ideal_answer: "Break down into basics, use analogies, avoid jargon.", difficulty: "intermediate", follow_up: "Any feedback?" },
  ],
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json() as Record<string, unknown>;
    let tech = (body.tech as string || "general").toLowerCase().trim();
    const count = Math.min((body.count as number) || 5, 8);

    console.log(`🎯 Interview request: tech="${tech}", count=${count}`);

    // Get questions for tech, default to general
    let questions = questionBank[tech] || questionBank["general"];
    
    // Shuffle and limit
    questions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((q, idx) => ({ ...q, id: `${tech}-${idx}` }));

    console.log(`✅ Returning ${questions.length} interview questions for ${tech}`);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-interviews error:", e);
    
    const fallback = questionBank["general"].slice(0, 3);
    
    return new Response(JSON.stringify({ 
      questions: fallback,
      error: e instanceof Error ? e.message : "Using general questions"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
