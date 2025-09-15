#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for AIPMA Website
Tests all backend endpoints for the Alianza Internacional de Periodismo y Medios Audiovisuales
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import sys
import os

# Get the base URL from environment - using localhost for testing
BASE_URL = "http://localhost:3000"
API_BASE = f"{BASE_URL}/api"

class AIpmaAPITester:
    def __init__(self):
        self.test_results = []
        self.failed_tests = []
        self.passed_tests = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            self.passed_tests.append(test_name)
            print(f"✅ {test_name}: {message}")
        else:
            self.failed_tests.append(test_name)
            print(f"❌ {test_name}: {message}")
            if details:
                print(f"   Details: {details}")
    
    def test_api_info_endpoint(self):
        """Test GET /api/ - API info endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response contains expected fields
                if 'message' in data and 'endpoints' in data:
                    # Verify endpoints list
                    expected_endpoints = ['/api/noticias', '/api/eventos', '/api/miembros', '/api/contacto']
                    actual_endpoints = data['endpoints']
                    
                    missing_endpoints = [ep for ep in expected_endpoints if ep not in actual_endpoints]
                    if not missing_endpoints:
                        self.log_result(
                            "API Info Endpoint", 
                            True, 
                            "API info endpoint working correctly",
                            f"Message: {data['message']}, Endpoints: {actual_endpoints}"
                        )
                    else:
                        self.log_result(
                            "API Info Endpoint", 
                            False, 
                            f"Missing expected endpoints: {missing_endpoints}",
                            f"Expected: {expected_endpoints}, Got: {actual_endpoints}"
                        )
                else:
                    self.log_result(
                        "API Info Endpoint", 
                        False, 
                        "Response missing required fields (message, endpoints)",
                        f"Response: {data}"
                    )
            else:
                self.log_result(
                    "API Info Endpoint", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("API Info Endpoint", False, f"Request failed: {str(e)}")
    
    def test_get_noticias(self):
        """Test GET /api/noticias - Get news articles"""
        try:
            response = requests.get(f"{API_BASE}/noticias", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'noticias' in data and isinstance(data['noticias'], list):
                    noticias = data['noticias']
                    
                    if len(noticias) > 0:
                        # Test first article structure
                        first_article = noticias[0]
                        required_fields = ['id', 'titulo', 'resumen', 'contenido', 'categoria', 'autor', 'fecha']
                        missing_fields = [field for field in required_fields if field not in first_article]
                        
                        if not missing_fields:
                            # Check if content is in Spanish
                            spanish_indicators = ['ética', 'periodística', 'internacional', 'medios', 'audiovisuales']
                            content_text = f"{first_article['titulo']} {first_article['resumen']} {first_article['contenido']}".lower()
                            has_spanish = any(indicator in content_text for indicator in spanish_indicators)
                            
                            # Check UUID format
                            try:
                                uuid.UUID(first_article['id'])
                                uuid_valid = True
                            except ValueError:
                                uuid_valid = False
                            
                            if has_spanish and uuid_valid:
                                self.log_result(
                                    "GET Noticias", 
                                    True, 
                                    f"Retrieved {len(noticias)} news articles with proper Spanish content and UUID format",
                                    f"Sample title: {first_article['titulo']}"
                                )
                            else:
                                issues = []
                                if not has_spanish:
                                    issues.append("Spanish content not detected")
                                if not uuid_valid:
                                    issues.append("Invalid UUID format")
                                self.log_result(
                                    "GET Noticias", 
                                    False, 
                                    f"Data validation issues: {', '.join(issues)}",
                                    f"ID: {first_article['id']}, Title: {first_article['titulo']}"
                                )
                        else:
                            self.log_result(
                                "GET Noticias", 
                                False, 
                                f"Missing required fields: {missing_fields}",
                                f"Available fields: {list(first_article.keys())}"
                            )
                    else:
                        self.log_result("GET Noticias", False, "No news articles found", "Empty noticias array")
                else:
                    self.log_result(
                        "GET Noticias", 
                        False, 
                        "Invalid response structure",
                        f"Expected 'noticias' array, got: {type(data.get('noticias'))}"
                    )
            else:
                self.log_result(
                    "GET Noticias", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("GET Noticias", False, f"Request failed: {str(e)}")
    
    def test_get_eventos(self):
        """Test GET /api/eventos - Get events"""
        try:
            response = requests.get(f"{API_BASE}/eventos", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'eventos' in data and isinstance(data['eventos'], list):
                    eventos = data['eventos']
                    
                    if len(eventos) > 0:
                        # Test first event structure
                        first_event = eventos[0]
                        required_fields = ['id', 'titulo', 'descripcion', 'fecha', 'ubicacion', 'tipo', 'capacidad']
                        missing_fields = [field for field in required_fields if field not in first_event]
                        
                        if not missing_fields:
                            # Check if content is in Spanish
                            spanish_indicators = ['periodismo', 'digital', 'taller', 'verificación', 'hechos', 'medios']
                            content_text = f"{first_event['titulo']} {first_event['descripcion']}".lower()
                            has_spanish = any(indicator in content_text for indicator in spanish_indicators)
                            
                            # Check UUID format
                            try:
                                uuid.UUID(first_event['id'])
                                uuid_valid = True
                            except ValueError:
                                uuid_valid = False
                            
                            # Check if event date is in future (for demo data, just check format)
                            try:
                                event_date = datetime.fromisoformat(first_event['fecha'].replace('Z', '+00:00'))
                                date_valid = True
                            except:
                                date_valid = False
                            
                            if has_spanish and uuid_valid and date_valid:
                                self.log_result(
                                    "GET Eventos", 
                                    True, 
                                    f"Retrieved {len(eventos)} events with proper Spanish content, UUID format, and valid dates",
                                    f"Sample title: {first_event['titulo']}, Date: {first_event['fecha']}"
                                )
                            else:
                                issues = []
                                if not has_spanish:
                                    issues.append("Spanish content not detected")
                                if not uuid_valid:
                                    issues.append("Invalid UUID format")
                                if not date_valid:
                                    issues.append("Invalid date format")
                                self.log_result(
                                    "GET Eventos", 
                                    False, 
                                    f"Data validation issues: {', '.join(issues)}",
                                    f"ID: {first_event['id']}, Title: {first_event['titulo']}"
                                )
                        else:
                            self.log_result(
                                "GET Eventos", 
                                False, 
                                f"Missing required fields: {missing_fields}",
                                f"Available fields: {list(first_event.keys())}"
                            )
                    else:
                        self.log_result("GET Eventos", False, "No events found", "Empty eventos array")
                else:
                    self.log_result(
                        "GET Eventos", 
                        False, 
                        "Invalid response structure",
                        f"Expected 'eventos' array, got: {type(data.get('eventos'))}"
                    )
            else:
                self.log_result(
                    "GET Eventos", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("GET Eventos", False, f"Request failed: {str(e)}")
    
    def test_get_miembros(self):
        """Test GET /api/miembros - Get members"""
        try:
            response = requests.get(f"{API_BASE}/miembros", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'miembros' in data and isinstance(data['miembros'], list):
                    miembros = data['miembros']
                    
                    if len(miembros) > 0:
                        # Test first member structure
                        first_member = miembros[0]
                        required_fields = ['id', 'nombre', 'organizacion', 'especialidad', 'pais', 'tipo', 'fechaIngreso']
                        missing_fields = [field for field in required_fields if field not in first_member]
                        
                        if not missing_fields:
                            # Check if content includes Spanish names/organizations
                            spanish_indicators = ['periodismo', 'investigativo', 'producción', 'audiovisual', 'digital']
                            content_text = f"{first_member['especialidad']} {first_member['organizacion']}".lower()
                            has_spanish_content = any(indicator in content_text for indicator in spanish_indicators)
                            
                            # Check UUID format
                            try:
                                uuid.UUID(first_member['id'])
                                uuid_valid = True
                            except ValueError:
                                uuid_valid = False
                            
                            # Check date format
                            try:
                                join_date = datetime.fromisoformat(first_member['fechaIngreso'].replace('Z', '+00:00'))
                                date_valid = True
                            except:
                                date_valid = False
                            
                            if uuid_valid and date_valid:
                                self.log_result(
                                    "GET Miembros", 
                                    True, 
                                    f"Retrieved {len(miembros)} members with proper UUID format and valid dates",
                                    f"Sample member: {first_member['nombre']} - {first_member['especialidad']}"
                                )
                            else:
                                issues = []
                                if not uuid_valid:
                                    issues.append("Invalid UUID format")
                                if not date_valid:
                                    issues.append("Invalid date format")
                                self.log_result(
                                    "GET Miembros", 
                                    False, 
                                    f"Data validation issues: {', '.join(issues)}",
                                    f"ID: {first_member['id']}, Name: {first_member['nombre']}"
                                )
                        else:
                            self.log_result(
                                "GET Miembros", 
                                False, 
                                f"Missing required fields: {missing_fields}",
                                f"Available fields: {list(first_member.keys())}"
                            )
                    else:
                        self.log_result("GET Miembros", False, "No members found", "Empty miembros array")
                else:
                    self.log_result(
                        "GET Miembros", 
                        False, 
                        "Invalid response structure",
                        f"Expected 'miembros' array, got: {type(data.get('miembros'))}"
                    )
            else:
                self.log_result(
                    "GET Miembros", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("GET Miembros", False, f"Request failed: {str(e)}")
    
    def test_post_contacto(self):
        """Test POST /api/contacto - Contact form submission"""
        try:
            test_data = {
                "nombre": "María Elena Rodríguez",
                "email": "maria.rodriguez@periodismo.es",
                "mensaje": "Estimados colegas, me interesa conocer más sobre las oportunidades de colaboración con AIPMA en proyectos de periodismo investigativo."
            }
            
            response = requests.post(
                f"{API_BASE}/contacto", 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and 'message' in data:
                    self.log_result(
                        "POST Contacto", 
                        True, 
                        "Contact form submission successful",
                        f"Response: {data['message']}"
                    )
                else:
                    self.log_result(
                        "POST Contacto", 
                        False, 
                        "Invalid response structure",
                        f"Expected success=True and message, got: {data}"
                    )
            else:
                self.log_result(
                    "POST Contacto", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("POST Contacto", False, f"Request failed: {str(e)}")
    
    def test_post_noticias(self):
        """Test POST /api/noticias - Create news article"""
        try:
            test_data = {
                "titulo": "Nuevo Protocolo de Verificación Digital para Medios Latinoamericanos",
                "resumen": "AIPMA presenta un innovador protocolo de verificación digital diseñado específicamente para medios de comunicación en América Latina.",
                "contenido": "La Alianza Internacional de Periodismo y Medios Audiovisuales ha desarrollado un protocolo revolucionario de verificación digital que promete transformar la manera en que los medios latinoamericanos abordan la verificación de hechos en la era digital. Este protocolo incluye herramientas de inteligencia artificial, metodologías de fact-checking y estándares éticos adaptados a la realidad regional.",
                "categoria": "Tecnología",
                "autor": "Dr. Carlos Mendoza",
                "fecha": (datetime.now() + timedelta(days=1)).isoformat()
            }
            
            response = requests.post(
                f"{API_BASE}/noticias", 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and 'noticia' in data:
                    created_article = data['noticia']
                    
                    # Verify UUID format
                    try:
                        uuid.UUID(created_article['id'])
                        uuid_valid = True
                    except ValueError:
                        uuid_valid = False
                    
                    # Verify all fields are present
                    required_fields = ['id', 'titulo', 'resumen', 'contenido', 'categoria', 'autor', 'fecha', 'fechaCreacion']
                    missing_fields = [field for field in required_fields if field not in created_article]
                    
                    if uuid_valid and not missing_fields:
                        self.log_result(
                            "POST Noticias", 
                            True, 
                            "News article created successfully with proper UUID and all required fields",
                            f"Created article ID: {created_article['id']}, Title: {created_article['titulo']}"
                        )
                    else:
                        issues = []
                        if not uuid_valid:
                            issues.append("Invalid UUID format")
                        if missing_fields:
                            issues.append(f"Missing fields: {missing_fields}")
                        self.log_result(
                            "POST Noticias", 
                            False, 
                            f"Data validation issues: {', '.join(issues)}",
                            f"Created article: {created_article}"
                        )
                else:
                    self.log_result(
                        "POST Noticias", 
                        False, 
                        "Invalid response structure",
                        f"Expected success=True and noticia, got: {data}"
                    )
            else:
                self.log_result(
                    "POST Noticias", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("POST Noticias", False, f"Request failed: {str(e)}")
    
    def test_post_eventos(self):
        """Test POST /api/eventos - Create event"""
        try:
            test_data = {
                "titulo": "Seminario Internacional de Periodismo de Datos",
                "descripcion": "Un seminario intensivo sobre las últimas técnicas y herramientas de periodismo de datos, dirigido a profesionales de medios de comunicación de habla hispana.",
                "fecha": (datetime.now() + timedelta(days=60)).isoformat(),
                "ubicacion": "Ciudad de México, México",
                "tipo": "seminario",
                "capacidad": 80
            }
            
            response = requests.post(
                f"{API_BASE}/eventos", 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and 'evento' in data:
                    created_event = data['evento']
                    
                    # Verify UUID format
                    try:
                        uuid.UUID(created_event['id'])
                        uuid_valid = True
                    except ValueError:
                        uuid_valid = False
                    
                    # Verify all fields are present
                    required_fields = ['id', 'titulo', 'descripcion', 'fecha', 'ubicacion', 'tipo', 'capacidad', 'fechaCreacion']
                    missing_fields = [field for field in required_fields if field not in created_event]
                    
                    if uuid_valid and not missing_fields:
                        self.log_result(
                            "POST Eventos", 
                            True, 
                            "Event created successfully with proper UUID and all required fields",
                            f"Created event ID: {created_event['id']}, Title: {created_event['titulo']}"
                        )
                    else:
                        issues = []
                        if not uuid_valid:
                            issues.append("Invalid UUID format")
                        if missing_fields:
                            issues.append(f"Missing fields: {missing_fields}")
                        self.log_result(
                            "POST Eventos", 
                            False, 
                            f"Data validation issues: {', '.join(issues)}",
                            f"Created event: {created_event}"
                        )
                else:
                    self.log_result(
                        "POST Eventos", 
                        False, 
                        "Invalid response structure",
                        f"Expected success=True and evento, got: {data}"
                    )
            else:
                self.log_result(
                    "POST Eventos", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("POST Eventos", False, f"Request failed: {str(e)}")
    
    def test_post_miembros(self):
        """Test POST /api/miembros - Create member"""
        try:
            test_data = {
                "nombre": "Isabella Fernández",
                "organizacion": "Radio Televisión Española",
                "especialidad": "Periodismo Radiofónico",
                "pais": "España",
                "tipo": "periodista",
                "fechaIngreso": datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{API_BASE}/miembros", 
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success') and 'miembro' in data:
                    created_member = data['miembro']
                    
                    # Verify UUID format
                    try:
                        uuid.UUID(created_member['id'])
                        uuid_valid = True
                    except ValueError:
                        uuid_valid = False
                    
                    # Verify all fields are present
                    required_fields = ['id', 'nombre', 'organizacion', 'especialidad', 'pais', 'tipo', 'fechaIngreso', 'fechaCreacion']
                    missing_fields = [field for field in required_fields if field not in created_member]
                    
                    if uuid_valid and not missing_fields:
                        self.log_result(
                            "POST Miembros", 
                            True, 
                            "Member created successfully with proper UUID and all required fields",
                            f"Created member ID: {created_member['id']}, Name: {created_member['nombre']}"
                        )
                    else:
                        issues = []
                        if not uuid_valid:
                            issues.append("Invalid UUID format")
                        if missing_fields:
                            issues.append(f"Missing fields: {missing_fields}")
                        self.log_result(
                            "POST Miembros", 
                            False, 
                            f"Data validation issues: {', '.join(issues)}",
                            f"Created member: {created_member}"
                        )
                else:
                    self.log_result(
                        "POST Miembros", 
                        False, 
                        "Invalid response structure",
                        f"Expected success=True and miembro, got: {data}"
                    )
            else:
                self.log_result(
                    "POST Miembros", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("POST Miembros", False, f"Request failed: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for invalid endpoints and malformed requests"""
        try:
            # Test invalid endpoint
            response = requests.get(f"{API_BASE}/invalid-endpoint", timeout=10)
            
            if response.status_code == 200:
                # Should return API info for unknown endpoints
                data = response.json()
                if 'message' in data and 'endpoints' in data:
                    self.log_result(
                        "Error Handling - Invalid Endpoint", 
                        True, 
                        "Invalid endpoint returns API info correctly",
                        f"Response: {data['message']}"
                    )
                else:
                    self.log_result(
                        "Error Handling - Invalid Endpoint", 
                        False, 
                        "Invalid endpoint response structure incorrect",
                        f"Response: {data}"
                    )
            else:
                self.log_result(
                    "Error Handling - Invalid Endpoint", 
                    False, 
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
            
            # Test malformed POST request
            response = requests.post(
                f"{API_BASE}/contacto", 
                json={"invalid": "data"},  # Missing required fields
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            # This might succeed or fail depending on validation - both are acceptable
            if response.status_code in [200, 400, 422]:
                self.log_result(
                    "Error Handling - Malformed Request", 
                    True, 
                    f"Malformed request handled appropriately (HTTP {response.status_code})",
                    response.text[:200] if response.text else "No response body"
                )
            else:
                self.log_result(
                    "Error Handling - Malformed Request", 
                    False, 
                    f"Unexpected status code for malformed request: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_result("Error Handling", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting comprehensive AIPMA Backend API Testing...")
        print(f"📍 Testing against: {API_BASE}")
        print("=" * 80)
        
        # Run all tests
        self.test_api_info_endpoint()
        self.test_get_noticias()
        self.test_get_eventos()
        self.test_get_miembros()
        self.test_post_contacto()
        self.test_post_noticias()
        self.test_post_eventos()
        self.test_post_miembros()
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {len(self.passed_tests)}")
        print(f"❌ Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {len(self.passed_tests)}/{len(self.test_results)} ({len(self.passed_tests)/len(self.test_results)*100:.1f}%)")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        if self.passed_tests:
            print("\n✅ PASSED TESTS:")
            for test in self.passed_tests:
                print(f"   - {test}")
        
        return len(self.failed_tests) == 0

if __name__ == "__main__":
    tester = AIpmaAPITester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)