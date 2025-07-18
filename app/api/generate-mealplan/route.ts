import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openAI = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_KEY,
    baseURL: 'https://openrouter.ai/v1',
});

export async function POST (request: NextRequest) {
   try {
         const  {dietType, caloriesCount, allergies, cuisine, snacks} = 
            await request.json();
            console.log("Received data:", {dietType, caloriesCount, allergies, cuisine, snacks});
            const prompt = `
            You are a professional nutritionist. Create a 7-day meal plan for an individual following a ${dietType} diet aiming for ${caloriesCount} calories per day.
            
            Allergies or restrictions: ${allergies || "none"}.
            Preferred cuisine: ${cuisine || "no preference"}.
            Snacks included: ${snacks ? "yes" : "no"}.
            
            For each day, provide:
                - Breakfast
                - Lunch
                - Dinner
                ${snacks ? "- Snacks" : ""}
            
            Use simple ingredients and provide brief instructions. Include approximate calorie counts for each meal.
            
            Structure the response as a JSON object where each day is a key, and each meal (breakfast, lunch, dinner, snacks) is a sub-key. Example:
            
            {
                "Monday": {
                    "Breakfast": "Oatmeal with fruits - 350 calories",
                    "Lunch": "Grilled chicken salad - 500 calories",
                    "Dinner": "Steamed vegetables with quinoa - 600 calories",
                    "Snacks": "Greek yogurt - 150 calories"
                },
                "Tuesday": {
                    "Breakfast": "Smoothie bowl - 300 calories",
                    "Lunch": "Turkey sandwich - 450 calories",
                    "Dinner": "Baked salmon with asparagus - 700 calories",
                    "Snacks": "Almonds - 200 calories"
                }
                // ...and so on for each day
            }

            Return just the json with no extra commentaries and no backticks.
            `;


    
         // Call OpenAI API
         const response = await openAI.chat.completions.create({
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 1500, // 
              temperature: 0.7,
         });
    
         const aiResponse = response.choices[0].message.content!.trim();
         console.log(aiResponse);
         
         let parsedMealPlan: {[day: string]: dailyMealPlan};
         try {
             parsedMealPlan = JSON.parse(aiResponse);
             // Return the parsed meal plan
             return NextResponse.json({ mealPlan: parsedMealPlan });             
         } catch (parseError) {
             console.error("Error parsing JSON:", parseError);
             return NextResponse.json({ error: "Invalid response format from OpenAI" }, { status: 500 });
         }
         
   }
   catch (error:any) {
       console.error("Error in OpenAI API call:", error.message);
       return new Response(JSON.stringify({ error: error.message }), { status: 500 });
   }
}

interface dailyMealPlan {
    Breakfast?: string;
    Lunch?: string;
    Dinner?: string;
    Snacks?: string;
}