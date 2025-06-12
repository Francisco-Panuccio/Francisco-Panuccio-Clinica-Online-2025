import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  supabase;
  
  constructor() { 
    this.supabase = createClient("https://hlnljtgjjrwtpydvvywp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbmxqdGdqanJ3dHB5ZHZ2eXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzE5NjksImV4cCI6MjA2MzQ0Nzk2OX0.teNmkfY6ghTGq8IC2QdqrLTj8Fsnp-hira3fma_oT9w")
  }
}
